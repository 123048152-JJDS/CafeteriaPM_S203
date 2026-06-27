from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Category(Base):
    __tablename__ = "categorias"

    id     = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    tipo   = Column(String(20),  nullable=False)

    productos = relationship("Product", back_populates="categoria")
    gastos    = relationship("Expense",  back_populates="categoria")


class Product(Base):
    __tablename__ = "productos"

    id           = Column(Integer, primary_key=True, index=True)
    nombre       = Column(String(150),  nullable=False)
    descripcion  = Column(Text,         nullable=True)
    precio       = Column(Numeric(10, 2), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    disponible   = Column(Boolean, nullable=False, default=True)
    imagen_url   = Column(String(255), nullable=True)
    created_at   = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relaciones
    categoria    = relationship("Category",          back_populates="productos")
    ingredientes = relationship("ProductIngredient", back_populates="producto")
    detalles     = relationship("OrderDetail",       back_populates="producto")


class ProductIngredient(Base):
    __tablename__ = "producto_ingrediente"

    id_producto    = Column(Integer, ForeignKey("productos.id", ondelete="CASCADE"),    primary_key=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id", ondelete="CASCADE"), primary_key=True)
    cantidad       = Column(Numeric(10, 3), nullable=False)

    # Relaciones
    producto    = relationship("Product",    back_populates="ingredientes")
    ingrediente = relationship("Ingredient", back_populates="productos")
