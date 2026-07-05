from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.table import Table
from app.models.order import Order, OrderStatus
from pydantic import BaseModel

router = APIRouter(prefix="/mesas", tags=["Mesas"])

class MesaCreate(BaseModel):
    numero: int
    capacidad: int

class MesaOut(BaseModel):
    id: int
    numero: int
    capacidad: int
    estado: str  # "disponible", "ocupada", "reservada"
    pedido_activo_id: Optional[int] = None

    class Config:
        from_attributes = True

def get_estado_mesa(db: Session, mesa_id: int):
    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]

    pedido_activo = db.query(Order).filter(
        Order.id_mesa == mesa_id,
        Order.id_estado_actual.in_(ids_activos)
    ).first()

    if pedido_activo:
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
    
    db.delete(mesa)
    db.commit()