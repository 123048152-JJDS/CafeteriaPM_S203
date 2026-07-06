from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Table(Base):
    __tablename__ = "mesas"

    id        = Column(Integer, primary_key=True, index=True)
    numero    = Column(Integer, nullable=False, unique=True)
    capacidad = Column(Integer, nullable=False)

    pedidos = relationship("Order", back_populates="mesa")
