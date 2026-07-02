from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class GastoCreate(BaseModel):
    descripcion: str
    monto: float
    id_categoria: Optional[int] = None
    fecha: date

class GastoOut(BaseModel):
    id: int
    descripcion: str
    monto: float
    categoria: Optional[dict]
    usuario: Optional[dict]
    fecha: date
    created_at: datetime
    model_config = {"from_attributes": True}