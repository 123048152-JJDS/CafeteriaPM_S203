from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CompraCreate(BaseModel):
    id_ingrediente: int
    cantidad: float
    costo_total: float
    fecha: date

class CompraOut(BaseModel):
    id: int
    id_ingrediente: int
    ingrediente: Optional[dict]
    usuario: Optional[dict]
    cantidad: float
    costo_total: float
    fecha: date
    created_at: datetime
    model_config = {"from_attributes": True}