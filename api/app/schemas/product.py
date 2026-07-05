from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryOut(BaseModel):
    id:     int
    nombre: str
    tipo:   str
    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    nombre: str
    tipo:   str

class IngredientOut(BaseModel):
    id: int
    nombre: str
    unidad: str
    stock_actual: float
    stock_minimo: float
    costo_unitario: float
    model_config = {"from_attributes": True}

class IngredientCreate(BaseModel):
    nombre:         str
    unidad:         str
    stock_actual:   float = 0
    stock_minimo:   float = 0
    costo_unitario: float = 0

class IngredientUpdate(BaseModel):
    nombre:         Optional[str]   = None
    unidad:         Optional[str]   = None
    stock_actual:   Optional[float] = None
    stock_minimo:   Optional[float] = None
    costo_unitario: Optional[float] = None

class ProductIngredientOut(BaseModel):
    id_ingrediente: int
    nombre:         str
    unidad:         str
    cantidad:       float
    model_config = {"from_attributes": True}

class ProductIngredientCreate(BaseModel):
    id_ingrediente: int
    cantidad:       float

class ProductCreate(BaseModel):
    nombre:        str
    descripcion:   Optional[str]   = None
    precio:        float
    id_categoria:  Optional[int]   = None
    disponible:    bool            = True
    imagen_url:    Optional[str]   = None
    ingredientes:  list[ProductIngredientCreate] = []

class ProductUpdate(BaseModel):
    nombre:       Optional[str]   = None
    descripcion:  Optional[str]   = None
    precio:       Optional[float] = None
    id_categoria: Optional[int]   = None
    disponible:   Optional[bool]  = None
    imagen_url:   Optional[str]   = None

class ProductOut(BaseModel):
    id:          int
    nombre:      str
    descripcion: Optional[str]
    precio:      float
    disponible:  bool
    categoria:   Optional[CategoryOut]
    created_at:  datetime
    model_config = {"from_attributes": True}

class ProductDetailOut(ProductOut):
    ingredientes: list[ProductIngredientOut] = []
