from pydantic import BaseModel
from typing import Optional

class TableOut(BaseModel):
    id: int
    numero: int
    capacidad: int
    estado: str  # "disponible" | "ocupada"
    pedido_activo_id: Optional[int] = None
    model_config = {"from_attributes": True}