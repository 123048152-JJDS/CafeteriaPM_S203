from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)

    usuarios        = relationship("User",         back_populates="role")
    estados_pedido  = relationship("OrderStatus",  back_populates="role")
