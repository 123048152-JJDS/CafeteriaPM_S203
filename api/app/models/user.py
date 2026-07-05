from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "usuarios"

    id            = Column(Integer, primary_key=True, index=True)
    nombre        = Column(String(100), nullable=False)
    email         = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    id_rol        = Column(Integer, ForeignKey("roles.id"), nullable=False)
    activo        = Column(Boolean, nullable=False, default=True)
    created_at    = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    role                  = relationship("Role",     back_populates="usuarios")
    pedidos               = relationship("Order",    back_populates="mesero",
                                         foreign_keys="Order.id_mesero")
    ventas                = relationship("Sale",     back_populates="cajero")
    gastos                = relationship("Expense",  back_populates="usuario")
    compras               = relationship("Purchase", back_populates="usuario")
    historial_estados     = relationship("OrderStatusHistory", back_populates="usuario")
