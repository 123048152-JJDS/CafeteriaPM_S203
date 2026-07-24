from datetime import datetime
from sqlalchemy.exc import IntegrityError

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.table import Table
from app.models.order import Order, OrderStatus, OrderStatusHistory
from app.schemas.mesa import MesaCreate, MesaOut 

router = APIRouter(prefix="/mesas", tags=["Mesas"])

def get_estado_mesa(db: Session, mesa_id: int):
    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado", "reservado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]

    pedido_activo = db.query(Order).filter(
        Order.id_mesa == mesa_id,
        Order.id_estado_actual.in_(ids_activos)
    ).first()

    if pedido_activo:
        if pedido_activo.estado_actual.nombre == "reservado":
            return "reservada", pedido_activo.id
        else:
            return "ocupada", pedido_activo.id
    return "disponible", None

@router.get("/", response_model=List[MesaOut])
def get_mesas(db: Session = Depends(get_db), _=Depends(get_current_user)):
    mesas = db.query(Table).all()
    result = []
    for mesa in mesas:
        estado, pedido_id = get_estado_mesa(db, mesa.id)
        result.append(MesaOut(
            id=mesa.id,
            numero=mesa.numero,
            capacidad=mesa.capacidad,
            estado=estado,
            pedido_activo_id=pedido_id
        ))
    return result

@router.get("/{mesa_id}", response_model=MesaOut)
def get_mesa(mesa_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")
    estado, pedido_id = get_estado_mesa(db, mesa.id)
    return MesaOut(
        id=mesa.id,
        numero=mesa.numero,
        capacidad=mesa.capacidad,
        estado=estado,
        pedido_activo_id=pedido_id
    )

@router.get("/por-numero/{numero}", response_model=MesaOut)
def get_mesa_by_numero(numero: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mesa = db.query(Table).filter(Table.numero == numero).first()
    if not mesa:
        raise HTTPException(404, f"Mesa número {numero} no encontrada")
    estado, pedido_id = get_estado_mesa(db, mesa.id)
    return MesaOut(
        id=mesa.id,
        numero=mesa.numero,
        capacidad=mesa.capacidad,
        estado=estado,
        pedido_activo_id=pedido_id
    )

@router.post("/", response_model=MesaOut, status_code=201)
def create_mesa(
    data: MesaCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    existing = db.query(Table).filter(Table.numero == data.numero).first()
    if existing:
        raise HTTPException(400, f"Ya existe una mesa con el número {data.numero}")
    
    mesa = Table(
        numero=data.numero,
        capacidad=data.capacidad
    )
    db.add(mesa)
    db.commit()
    db.refresh(mesa)
    
    estado, _ = get_estado_mesa(db, mesa.id)
    return MesaOut(
        id=mesa.id,
        numero=mesa.numero,
        capacidad=mesa.capacidad,
        estado=estado,
        pedido_activo_id=None
    )

@router.delete("/{mesa_id}", status_code=204)
def delete_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")
    
    estado, pedido_id = get_estado_mesa(db, mesa.id)
    if estado != "disponible":
        raise HTTPException(
            400,
            f"No se puede eliminar la mesa porque está {estado}. "
            f"Primero debe cerrar el pedido #{pedido_id}."
        )
    try:
        db.delete(mesa)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la mesa porque tiene pedidos históricos asociados."
        )
    
@router.patch("/{mesa_id}/ocupar")
def ocupar_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "mesero"))
):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")

    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    pedido_activo = db.query(Order).filter(
        Order.id_mesa == mesa_id,
        Order.id_estado_actual.in_(ids_activos)
    ).first()
    if pedido_activo:
        raise HTTPException(400, "La mesa ya está ocupada")

    estado_pendiente = db.query(OrderStatus).filter(OrderStatus.nombre == "pendiente").first()
    if not estado_pendiente:
        raise HTTPException(500, "Estado 'pendiente' no configurado")

    pedido = Order(
        id_mesa=mesa_id,
        id_mesero=current_user.id,
        id_estado_actual=estado_pendiente.id,
    )
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    return {"message": "Mesa ocupada correctamente", "pedido_id": pedido.id}

@router.patch("/{mesa_id}/liberar")
def liberar_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "mesero", "caja"))
):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")

    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    pedido_activo = db.query(Order).filter(
        Order.id_mesa == mesa_id,
        Order.id_estado_actual.in_(ids_activos)
    ).first()

    if not pedido_activo:
        raise HTTPException(400, "La mesa no tiene pedido activo")

    estado_pagado = db.query(OrderStatus).filter(OrderStatus.nombre == "pagado").first()
    if not estado_pagado:
        raise HTTPException(500, "Estado 'pagado' no configurado")

    pedido_activo.id_estado_actual = estado_pagado.id
    pedido_activo.updated_at = datetime.now()

    historial = OrderStatusHistory(
        id_pedido=pedido_activo.id,
        id_estado_origen=pedido_activo.id_estado_actual,
        id_estado_destino=estado_pagado.id,
        id_usuario=current_user.id,
    )
    db.add(historial)
    db.commit()

    return {"message": "Mesa liberada correctamente", "pedido_id": pedido_activo.id}

@router.patch("/{mesa_id}/reservar")
def reservar_mesa(
    mesa_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "mesero"))
):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")

    estado, _ = get_estado_mesa(db, mesa.id)
    if estado != "disponible":
        raise HTTPException(400, "La mesa no está disponible para reservar")

    estado_reservado = db.query(OrderStatus).filter(OrderStatus.nombre == "reservado").first()
    if not estado_reservado:
        raise HTTPException(500, "Estado 'reservado' no configurado")

    pedido = Order(
        id_mesa=mesa_id,
        id_mesero=current_user.id,
        id_estado_actual=estado_reservado.id,
    )
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    return {"message": "Mesa reservada correctamente", "pedido_id": pedido.id}

@router.patch("/{mesa_id}/cancelar-reserva")
def cancelar_reserva(
    mesa_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "mesero"))
):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")

    estado_reservado = db.query(OrderStatus).filter(OrderStatus.nombre == "reservado").first()
    if not estado_reservado:
        raise HTTPException(500, "Estado 'reservado' no configurado")

    pedido_reservado = db.query(Order).filter(
        Order.id_mesa == mesa_id,
        Order.id_estado_actual == estado_reservado.id
    ).first()

    if not pedido_reservado:
        raise HTTPException(400, "La mesa no tiene una reserva activa")

    estado_cancelado = db.query(OrderStatus).filter(OrderStatus.nombre == "cancelado").first()
    if estado_cancelado:
        pedido_reservado.id_estado_actual = estado_cancelado.id
        pedido_reservado.updated_at = datetime.now()
        db.commit()
    else:
        db.delete(pedido_reservado)
        db.commit()

    return {"message": "Reserva cancelada correctamente"}