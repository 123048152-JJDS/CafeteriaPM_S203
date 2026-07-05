from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.expense import Purchase
from app.models.ingredient import Ingredient
from app.schemas.compra import CompraCreate, CompraOut

router = APIRouter(prefix="/compras", tags=["Compras"])

@router.get("/", response_model=List[CompraOut])
def get_compras(db: Session = Depends(get_db), _=Depends(require_roles("admin", "cocina"))):
    compras = db.query(Purchase).order_by(Purchase.created_at.desc()).all()
    return compras

@router.post("/", response_model=CompraOut, status_code=status.HTTP_201_CREATED)
def create_compra(
    data: CompraCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "cocina"))
):
    ingrediente = db.query(Ingredient).filter(Ingredient.id == data.id_ingrediente).first()
    if not ingrediente:
        raise HTTPException(400, "Ingrediente no encontrado")

    compra = Purchase(
        id_ingrediente=data.id_ingrediente,
        id_usuario=current_user.id,
        cantidad=data.cantidad,
        costo_total=data.costo_total,
        fecha=data.fecha,
    )
    db.add(compra)
    db.flush()

    ingrediente.stock_actual = float(ingrediente.stock_actual) + data.cantidad
    db.commit()

    db.refresh(compra)
    compra.ingrediente = ingrediente
    compra.usuario = current_user

    return compra