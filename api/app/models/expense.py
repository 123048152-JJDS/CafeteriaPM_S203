from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Expense(Base):
    __tablename__ = "gastos"

    id           = Column(Integer, primary_key=True, index=True)
    descripcion  = Column(String(255),  nullable=False)
    monto        = Column(Numeric(10, 2), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    id_usuario   = Column(Integer, ForeignKey("usuarios.id"),   nullable=False)
    fecha        = Column(Date,      nullable=False, server_default=func.current_date())
    created_at   = Column(TIMESTAMP, nullable=False, server_default=func.now())

    categoria = relationship("Category", back_populates="gastos")
    usuario   = relationship("User",     back_populates="gastos")


class Purchase(Base):
    __tablename__ = "compras_suministros"

    id             = Column(Integer, primary_key=True, index=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id"), nullable=False)
    id_usuario     = Column(Integer, ForeignKey("usuarios.id"),     nullable=False)
    cantidad       = Column(Numeric(10, 3), nullable=False)
    costo_total    = Column(Numeric(10, 2), nullable=False)
    fecha          = Column(Date,      nullable=False, server_default=func.current_date())
    created_at     = Column(TIMESTAMP, nullable=False, server_default=func.now())

    ingrediente = relationship("Ingredient", back_populates="compras")
    usuario     = relationship("User",       back_populates="compras")
