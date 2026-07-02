from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.table import Table
from app.models.order import Order, OrderStatus
from app.schemas.mesa import TableOut

router = APIRouter(prefix="/mesas", tags=["Mesas"])


@router.get("/", response_model=List[TableOut])
def get_mesas(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """
    Lista todas las mesas con su estado actual (disponible/ocupada).
    Se considera ocupada si tiene un pedido activo (no pagado ni cancelado).
    """
    mesas = db.query(Table).all()
    # Obtener IDs de estados que indican "activo"
    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    
    result = []
    for mesa in mesas:
        pedido_activo = db.query(Order).filter(
            Order.id_mesa == mesa.id,
            Order.id_estado_actual.in_(ids_activos)
        ).first()
        result.append(TableOut(
            id=mesa.id,
            numero=mesa.numero,
            capacidad=mesa.capacidad,
            estado="ocupada" if pedido_activo else "disponible",
            pedido_activo_id=pedido_activo.id if pedido_activo else None,
        ))
    return result


@router.get("/{mesa_id}", response_model=TableOut)
def get_mesa(mesa_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(404, "Mesa no encontrada")
    
    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    pedido_activo = db.query(Order).filter(
        Order.id_mesa == mesa.id,
        Order.id_estado_actual.in_(ids_activos)
    ).first()
    
    return TableOut(
        id=mesa.id,
        numero=mesa.numero,
        capacidad=mesa.capacidad,
        estado="ocupada" if pedido_activo else "disponible",
        pedido_activo_id=pedido_activo.id if pedido_activo else None,
    )