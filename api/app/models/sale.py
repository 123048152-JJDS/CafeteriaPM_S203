from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PaymentMethod(Base):
    __tablename__ = "metodos_pago"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(50),  nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)

    ventas = relationship("Sale", back_populates="metodo_pago")


class Sale(Base):
    __tablename__ = "ventas"

    id             = Column(Integer, primary_key=True, index=True)
    id_pedido      = Column(Integer, ForeignKey("pedidos.id"),      nullable=False, unique=True)
    id_cajero      = Column(Integer, ForeignKey("usuarios.id"),     nullable=False)
    id_metodo_pago = Column(Integer, ForeignKey("metodos_pago.id"), nullable=False)
    monto_total    = Column(Numeric(10, 2), nullable=False)
    monto_recibido = Column(Numeric(10, 2), nullable=True)
    # cambio se calcula: monto_recibido - monto_total (3FN)
    fecha          = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relaciones
    pedido       = relationship("Order",         back_populates="venta")
    cajero       = relationship("User",          back_populates="ventas")
    metodo_pago  = relationship("PaymentMethod", back_populates="ventas")
