from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import cast, String  # ← Nuevas importaciones

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.order import Order, OrderDetail, OrderDetailObservation, OrderStatus, OrderStatusHistory
from app.models.table import Table
from app.models.product import Product
from app.models.user import User
from app.services.inventario import descontar_ingredientes
from app.schemas.order import (
    OrderOut, OrderDetailOut, OrderCreate, OrderDetailCreate,
    OrderStatusChange, OrderStatusOut
)

router = APIRouter()



# ══════════════════════════════════════════════════════════════
#  ESTADOS DE PEDIDO (para consulta)
# ══════════════════════════════════════════════════════════════
@router.get("/estados", response_model=List[OrderStatusOut])
def get_estados(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(OrderStatus).all()


# ══════════════════════════════════════════════════════════════
#  PEDIDOS
# ══════════════════════════════════════════════════════════════

@router.get("/", response_model=List[OrderOut])
def get_pedidos(
    estado_id: Optional[int] = None,
    mesa_id: Optional[int] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    busqueda: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lista pedidos con filtros avanzados:
    - estado_id: ID del estado
    - mesa_id: ID de la mesa
    - fecha_inicio: YYYY-MM-DD
    - fecha_fin: YYYY-MM-DD
    - busqueda: texto para buscar en ID del pedido o número de mesa
    - limit: número máximo de resultados
    - offset: número de resultados a saltar (para paginación)
    """
    q = db.query(Order)
    
    if estado_id:
        q = q.filter(Order.id_estado_actual == estado_id)
    if mesa_id:
        q = q.filter(Order.id_mesa == mesa_id)
    if fecha_inicio:
        try:
            fecha_dt = datetime.fromisoformat(fecha_inicio)
            q = q.filter(Order.created_at >= fecha_dt)
        except ValueError:
            pass
    if fecha_fin:
        try:
            fecha_dt = datetime.fromisoformat(fecha_fin) + timedelta(days=1)
            q = q.filter(Order.created_at < fecha_dt)
        except ValueError:
            pass
    if busqueda:
        if busqueda.isdigit():
            q = q.filter(Order.id == int(busqueda))
        else:
            q = q.join(Order.mesa).filter(cast(Table.numero, String).ilike(f"%{busqueda}%"))
    
    # Aplicar límite y offset si existen
    if limit is not None:
        q = q.limit(limit)
    if offset is not None:
        q = q.offset(offset)
    
    return q.order_by(Order.created_at.desc()).all()


@router.get("/cola-cocina", response_model=List[OrderOut])
def get_cola_cocina(db: Session = Depends(get_db), _=Depends(get_current_user)):
    estados = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion"])
    ).all()
    ids = [e.id for e in estados]
    return db.query(Order).filter(Order.id_estado_actual.in_(ids)).order_by(
        Order.created_at.asc()
    ).all()


@router.get("/{pedido_id}", response_model=OrderOut)
def get_pedido(pedido_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    return pedido


@router.post("/", response_model=OrderOut, status_code=201)
def create_pedido(
    data: OrderCreate,
    db:   Session = Depends(get_db),
    current_user = Depends(require_roles("mesero", "admin"))
):
    """Crea un nuevo pedido. Solo mesero o admin."""
    # Verificar mesa
    mesa = db.query(Table).filter(Table.id == data.id_mesa).first()
    if not mesa:
        raise HTTPException(400, "Mesa no encontrada")

    # Obtener estado inicial "pendiente"
    estado_pendiente = db.query(OrderStatus).filter(
        OrderStatus.nombre == "pendiente"
    ).first()
    if not estado_pendiente:
        raise HTTPException(500, "Estado 'pendiente' no configurado en BD")

    # Crear pedido
    pedido = Order(
        id_mesa=data.id_mesa,
        id_mesero=current_user.id,
        id_estado_actual=estado_pendiente.id,
    )
    db.add(pedido)
    db.flush()

    # Agregar detalles
    total = 0.0
    for item in data.detalles:
        producto = db.query(Product).filter(Product.id == item.id_producto).first()
        if not producto:
            raise HTTPException(400, f"Producto ID {item.id_producto} no existe")
        if not producto.disponible:
            raise HTTPException(400, f"Producto '{producto.nombre}' no está disponible")

        precio_unitario = float(producto.precio)
        subtotal = precio_unitario * item.cantidad
        total += subtotal

        detalle = OrderDetail(
            id_pedido=pedido.id,
            id_producto=item.id_producto,
            cantidad=item.cantidad,
            precio_unitario=precio_unitario,
        )
        db.add(detalle)
        db.flush()

        # Observaciones del detalle
        if item.observacion:
            obs = OrderDetailObservation(
                id_detalle=detalle.id,
                observacion=item.observacion
            )
            db.add(obs)

    # Registrar historial inicial
    historial = OrderStatusHistory(
        id_pedido=pedido.id,
        id_estado_origen=None,
        id_estado_destino=estado_pendiente.id,
        id_usuario=current_user.id,
    )
    db.add(historial)

    db.commit()
    db.refresh(pedido)
    return pedido


@router.patch("/{pedido_id}/estado", response_model=OrderOut)
def cambiar_estado(
    pedido_id: int,
    data: OrderStatusChange,
    db:   Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Cambia el estado de un pedido.
    - pendiente → en_preparacion (cocina)
    - en_preparacion → listo (cocina) → **DESCUENTA INVENTARIO**
    - listo → pagado (caja)
    - listo → entregado (mesero)
    - cualquier → cancelado (caja/admin)
    """
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")

    estado_nuevo = db.query(OrderStatus).filter(
        OrderStatus.id == data.id_estado_nuevo
    ).first()
    if not estado_nuevo:
        raise HTTPException(400, "Estado destino no válido")

    estado_actual_nombre = pedido.estado_actual.nombre
    estado_nuevo_nombre = estado_nuevo.nombre

    # ═══ VALIDACIONES DE FLUJO ═══
    # Regla 1: No se puede regresar a un estado anterior (excepto cancelado)
    if estado_nuevo_nombre == "cancelado":
        # Se puede cancelar desde cualquier estado
        pass
    else:
        # Verificar transición válida
        transiciones = {
            "pendiente": ["en_preparacion", "cancelado"],
            "en_preparacion": ["listo", "cancelado"],
            "listo": ["entregado", "pagado", "cancelado"],
            "entregado": ["pagado"],  # El mesero confirma entrega, luego caja cobra
            "pagado": [],  # Terminal, no se puede cambiar
        }
        if estado_nuevo_nombre not in transiciones.get(estado_actual_nombre, []):
            raise HTTPException(
                400,
                f"No se puede cambiar de '{estado_actual_nombre}' a '{estado_nuevo_nombre}'"
            )

    # ═══ LÓGICA ESPECIAL: DESCUENTO DE INVENTARIO ═══
    if estado_nuevo_nombre == "listo":
        # Solo cocina puede marcar como listo (por seguridad, pero el guard de rol lo hará)
        descontar_ingredientes(db, pedido.id)

    # ═══ ACTUALIZAR ESTADO ═══
    pedido.id_estado_actual = estado_nuevo.id
    pedido.updated_at = datetime.now()

    historial = OrderStatusHistory(
        id_pedido=pedido.id,
        id_estado_origen=pedido.estado_actual.id if pedido.estado_actual else None,
        id_estado_destino=estado_nuevo.id,
        id_usuario=current_user.id,
    )
    db.add(historial)
    db.commit()
    db.refresh(pedido)
    return pedido


@router.delete("/{pedido_id}", status_code=204)
def delete_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    """Elimina un pedido (solo admin)."""
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    if pedido.estado_actual.nombre != "cancelado":
        raise HTTPException(400, "Solo se pueden eliminar pedidos cancelados")
    db.delete(pedido)
    db.commit()