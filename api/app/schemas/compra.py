from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.schemas.product import IngredientOut  
from app.schemas.user import UserOut

class CompraCreate(BaseModel):
    id_ingrediente: int
    cantidad: float
    costo_total: float
    fecha: date

class CompraOut(BaseModel):
    id: int
    id_ingrediente: int
    ingrediente: Optional[IngredientOut] = None
    usuario: Optional[UserOut] = None
    cantidad: float
    costo_total: float
    fecha: date
    created_at: datetime
    model_config = {"from_attributes": True}