from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.expense import Expense
from app.models.product import Category
from app.schemas.gasto import GastoCreate, GastoOut

router = APIRouter(prefix="/gastos", tags=["Gastos"])


@router.get("/", response_model=List[GastoOut])
def get_gastos(
    fecha_inicio: Optional[str] = None,
    fecha_fin:    Optional[str] = None,
    db:           Session = Depends(get_db),
    _=Depends(require_roles("admin", "caja"))
):
    q = db.query(Expense)
    if fecha_inicio:
        q = q.filter(Expense.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Expense.fecha <= fecha_fin)
    return q.order_by(Expense.fecha.desc()).all()


@router.post("/", response_model=GastoOut, status_code=201)
def create_gasto(
    data: GastoCreate,
    db:   Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "caja"))
):
    if data.id_categoria:
        cat = db.query(Category).filter(Category.id == data.id_categoria).first()
        if not cat:
            raise HTTPException(400, "Categoría no encontrada")
    
    gasto = Expense(
        descripcion=data.descripcion,
        monto=data.monto,
        id_categoria=data.id_categoria,
        id_usuario=current_user.id,
        fecha=data.fecha,
    )
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto