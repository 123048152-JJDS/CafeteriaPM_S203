from sqlalchemy import (Column, Integer, String, Numeric, Text,
                        ForeignKey, TIMESTAMP, Boolean, FetchedValue)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class OrderStatus(Base):
    __tablename__ = "estados_pedido"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(30),  nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)
    id_rol      = Column(Integer, ForeignKey("roles.id"), nullable=False)

    # Relaciones
    role                   = relationship("Role",               back_populates="estados_pedido")
    pedidos_actuales       = relationship("Order",              back_populates="estado_actual",
                                          foreign_keys="Order.id_estado_actual")
    historial_destino      = relationship("OrderStatusHistory", back_populates="estado_destino",
                                          foreign_keys="OrderStatusHistory.id_estado_destino")
    historial_origen       = relationship("OrderStatusHistory", back_populates="estado_origen",
                                          foreign_keys="OrderStatusHistory.id_estado_origen")


class Order(Base):
    __tablename__ = "pedidos"

    id               = Column(Integer, primary_key=True, index=True)
    id_mesa          = Column(Integer, ForeignKey("mesas.id"),    nullable=False)
    id_mesero        = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_estado_actual = Column(Integer, ForeignKey("estados_pedido.id"), nullable=False)
    created_at       = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at       = Column(TIMESTAMP, server_default=func.now(),
                              onupdate=func.now(), nullable=False)

    # Relaciones
    mesa          = relationship("Table",              back_populates="pedidos")
    mesero        = relationship("User",               back_populates="pedidos",
                                 foreign_keys=[id_mesero])
    estado_actual = relationship("OrderStatus",        back_populates="pedidos_actuales",
                                 foreign_keys=[id_estado_actual])
    detalles      = relationship("OrderDetail",        back_populates="pedido",
                                 cascade="all, delete-orphan")
    historial     = relationship("OrderStatusHistory", back_populates="pedido",
                                 cascade="all, delete-orphan")
    venta         = relationship("Sale",               back_populates="pedido", uselist=False)


class OrderDetail(Base):
    __tablename__ = "detalle_pedido"

    id              = Column(Integer, primary_key=True, index=True)
    id_pedido       = Column(Integer, ForeignKey("pedidos.id",   ondelete="CASCADE"), nullable=False)
    id_producto     = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad        = Column(Integer,       nullable=False)
    precio_unitario = Column(Numeric(10,2), nullable=False)
    # subtotal es columna generada en BD — SQLAlchemy solo la lee
    subtotal        = Column(Numeric(10,2), FetchedValue())

    # Relaciones
    pedido       = relationship("Order",   back_populates="detalles")
    producto     = relationship("Product", back_populates="detalles")
    observaciones = relationship("OrderDetailObservation", back_populates="detalle",
                                 cascade="all, delete-orphan")


class OrderDetailObservation(Base):
    __tablename__ = "detalle_observaciones"

    id          = Column(Integer, primary_key=True, index=True)
    id_detalle  = Column(Integer, ForeignKey("detalle_pedido.id", ondelete="CASCADE"),
                         nullable=False)
    observacion = Column(String(255), nullable=False)

    detalle = relationship("OrderDetail", back_populates="observaciones")


class OrderStatusHistory(Base):
    __tablename__ = "historial_estados_pedido"

    id                = Column(Integer, primary_key=True, index=True)
    id_pedido         = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    id_estado_origen  = Column(Integer, ForeignKey("estados_pedido.id"), nullable=True)
    id_estado_destino = Column(Integer, ForeignKey("estados_pedido.id"), nullable=False)
    id_usuario        = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    cambiado_en       = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relaciones
    pedido         = relationship("Order",       back_populates="historial")
    estado_origen  = relationship("OrderStatus", back_populates="historial_origen",
                                  foreign_keys=[id_estado_origen])
    estado_destino = relationship("OrderStatus", back_populates="historial_destino",
                                  foreign_keys=[id_estado_destino])
    usuario        = relationship("User",        back_populates="historial_estados")
