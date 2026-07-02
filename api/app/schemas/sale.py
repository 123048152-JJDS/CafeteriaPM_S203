from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentMethodOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    model_config = {"from_attributes": True}

class SaleCreate(BaseModel):
    id_pedido: int
    id_metodo_pago: int
    monto_recibido: Optional[float] = None

class SaleOut(BaseModel):
    id: int
    id_pedido: int
    id_cajero: int
    cajero: Optional[dict]
    metodo_pago: PaymentMethodOut
    monto_total: float
    monto_recibido: Optional[float]
    cambio: Optional[float]
    fecha: datetime
    model_config = {"from_attributes": True}