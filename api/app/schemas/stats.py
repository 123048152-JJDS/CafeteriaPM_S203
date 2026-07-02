from pydantic import BaseModel
from typing import List

class ProductoVendido(BaseModel):
    id: int
    nombre: str
    total_vendido: int

class VentaPorPeriodo(BaseModel):
    periodo: str
    total: float

class DashboardStats(BaseModel):
    ventas_hoy: float
    pedidos_activos: int
    stock_bajo: int
    gastos_hoy: float
    productos_mas_vendidos: List[ProductoVendido]