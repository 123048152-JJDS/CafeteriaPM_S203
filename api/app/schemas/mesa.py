from pydantic import BaseModel
from typing import Optional

class MesaCreate(BaseModel):
    numero: int
    capacidad: int

class MesaOut(BaseModel):
    id: int
    numero: int
    capacidad: int
    estado: str  # "disponible", "ocupada", "reservada"
    pedido_activo_id: Optional[int] = None
    model_config = {"from_attributes": True}