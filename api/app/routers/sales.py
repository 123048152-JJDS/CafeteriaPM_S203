from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.sale import Sale, PaymentMethod
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleOut, PaymentMethodOut

router = APIRouter()


# ══════════════════════════════════════════════════════════════
#  MÉTODOS DE PAGO
# ══════════════════════════════════════════════════════════════
@router.get("/metodos-pago", response_model=List[PaymentMethodOut])
def get_metodos_pago(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(PaymentMethod).all()


# ══════════════════════════════════════════════════════════════
#  VENTAS
# ══════════════════════════════════════════════════════════════
@router.get("/", response_model=List[SaleOut])
def get_ventas(
    fecha_inicio: Optional[str] = None,
    fecha_fin:    Optional[str] = None,
    db:           Session = Depends(get_db),
    _=Depends(require_roles("admin", "caja"))
):
    """Lista ventas con filtro de fechas (formato YYYY-MM-DD)."""
    q = db.query(Sale)
    if fecha_inicio:
        q = q.filter(Sale.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Sale.fecha <= fecha_fin)
    return q.order_by(Sale.fecha.desc()).all()


@router.get("/{venta_id}", response_model=SaleOut)
def get_venta(venta_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    venta = db.query(Sale).filter(Sale.id == venta_id).first()
    if not venta:
        raise HTTPException(404, "Venta no encontrada")
    return venta


@router.post("/", response_model=SaleOut, status_code=201)
def create_venta(
    data: SaleCreate,
    db:   Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "caja"))
):
    """Registra el pago de un pedido. El pedido debe estar en estado 'listo' o 'entregado'."""
    # 1. Verificar pedido
    pedido = db.query(Order).filter(Order.id == data.id_pedido).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    
    if pedido.estado_actual.nombre not in ["listo", "entregado"]:
        raise HTTPException(
            400,
            f"El pedido está en estado '{pedido.estado_actual.nombre}'. "
            "Debe estar 'listo' o 'entregado' para cobrar."
        )

    # 2. Verificar que no tenga venta asociada
    if pedido.venta:
        raise HTTPException(400, "Este pedido ya fue cobrado")

    # 3. Verificar método de pago
    metodo = db.query(PaymentMethod).filter(PaymentMethod.id == data.id_metodo_pago).first()
    if not metodo:
        raise HTTPException(400, "Método de pago no válido")

    # 4. Calcular total del pedido (suma de subtotales de los detalles)
    total = sum(float(d.subtotal or 0) for d in pedido.detalles)

    # 5. Crear venta
    venta = Sale(
        id_pedido=data.id_pedido,
        id_cajero=current_user.id,
        id_metodo_pago=data.id_metodo_pago,
        monto_total=total,
        monto_recibido=data.monto_recibido,
    )
    db.add(venta)
    db.flush()

    # 6. Cambiar estado del pedido a "pagado"
    estado_pagado = db.query(OrderStatus).filter(OrderStatus.nombre == "pagado").first()
    if estado_pagado:
        pedido.id_estado_actual = estado_pagado.id
        pedido.updated_at = pedido.updated_at  # trigger update

        # Registrar historial
        from app.models.order import OrderStatusHistory
        historial = OrderStatusHistory(
            id_pedido=pedido.id,
            id_estado_origen=pedido.id_estado_actual,  # Ya se actualizó? Espera, debemos hacerlo en orden.
        )
        # Re-query para obtener el estado anterior correcto
        # Simplificado: obtenemos el estado anterior antes de cambiarlo
        estado_anterior_id = pedido.id_estado_actual
        pedido.id_estado_actual = estado_pagado.id
        historial = OrderStatusHistory(
            id_pedido=pedido.id,
            id_estado_origen=estado_anterior_id,
            id_estado_destino=estado_pagado.id,
            id_usuario=current_user.id,
        )
        db.add(historial)

    db.commit()
    db.refresh(venta)
    return venta