from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base


class Ingredient(Base):
    __tablename__ = "ingredientes"

    id             = Column(Integer, primary_key=True, index=True)
    nombre         = Column(String(100), nullable=False)
    unidad         = Column(String(30),  nullable=False)
    stock_actual   = Column(Numeric(10, 3), nullable=False, default=0)
    stock_minimo   = Column(Numeric(10, 3), nullable=False, default=0)
    costo_unitario = Column(Numeric(10, 2), nullable=False, default=0)

    productos = relationship("ProductIngredient", back_populates="ingrediente")
    compras   = relationship("Purchase",          back_populates="ingrediente")
