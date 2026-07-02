from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.product import ProductOut
from app.schemas.user import UserOut

class OrderStatusOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    model_config = {"from_attributes": True}

class OrderDetailCreate(BaseModel):
    id_producto: int
    cantidad: int
    observacion: Optional[str] = None

class OrderCreate(BaseModel):
    id_mesa: int
    detalles: List[OrderDetailCreate]

class OrderStatusChange(BaseModel):
    id_estado_nuevo: int

class OrderDetailOut(BaseModel):
    id: int
    id_producto: int
    producto: Optional[ProductOut]
    cantidad: int
    precio_unitario: float
    subtotal: float
    observaciones: List[str] = []
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id: int
    id_mesa: int
    mesa: Optional[dict]
    id_mesero: int
    mesero: Optional[UserOut]
    estado_actual: OrderStatusOut
    detalles: List[OrderDetailOut]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}