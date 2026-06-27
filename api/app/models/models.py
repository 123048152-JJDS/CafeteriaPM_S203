from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text, Date, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Rol(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(255))

    usuarios = relationship("Usuario", back_populates="rol")
    estados_pedido = relationship("EstadoPedido", back_populates="rol")


class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)
    tipo = Column(String(20), nullable=False, CheckConstraint("tipo IN ('producto','gasto','ambos')"))

    productos = relationship("Producto", back_populates="categoria")
    gastos = relationship("Gasto", back_populates="categoria")


class MetodoPago(Base):
    __tablename__ = "metodos_pago"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(255))

    ventas = relationship("Venta", back_populates="metodo_pago")


class EstadoPedido(Base):
    __tablename__ = "estados_pedido"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(30), nullable=False, unique=True)
    descripcion = Column(String(255))
    id_rol = Column(Integer, ForeignKey("roles.id"), nullable=False)

    rol = relationship("Rol", back_populates="estados_pedido")
    pedidos = relationship("Pedido", foreign_keys="Pedido.id_estado_actual", back_populates="estado")
    historial_origen = relationship("HistorialEstadoPedido", foreign_keys="HistorialEstadoPedido.id_estado_origen", back_populates="estado_origen")
    historial_destino = relationship("HistorialEstadoPedido", foreign_keys="HistorialEstadoPedido.id_estado_destino", back_populates="estado_destino")


# ---------- TABLAS PRINCIPALES ----------
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    id_rol = Column(Integer, ForeignKey("roles.id"), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

    rol = relationship("Rol", back_populates="usuarios")
    pedidos_mesero = relationship("Pedido", foreign_keys="Pedido.id_mesero", back_populates="mesero")
    ventas_cajero = relationship("Venta", foreign_keys="Venta.id_cajero", back_populates="cajero")
    gastos = relationship("Gasto", back_populates="usuario")
    compras = relationship("CompraSuministro", back_populates="usuario")
    historial_cambios = relationship("HistorialEstadoPedido", back_populates="usuario")


class Mesa(Base):
    __tablename__ = "mesas"
    id = Column(Integer, primary_key=True)
    numero = Column(Integer, nullable=False, unique=True)
    capacidad = Column(Integer, nullable=False, CheckConstraint("capacidad > 0"))

    pedidos = relationship("Pedido", back_populates="mesa")


class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precio = Column(Numeric(10,2), nullable=False, CheckConstraint("precio >= 0"))
    id_categoria = Column(Integer, ForeignKey("categorias.id"))
    disponible = Column(Boolean, nullable=False, default=True)
    imagen_url = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=datetime.now)

    categoria = relationship("Categoria", back_populates="productos")
    detalles_pedido = relationship("DetallePedido", back_populates="producto")
    ingredientes = relationship("ProductoIngrediente", back_populates="producto")


class Ingrediente(Base):
    __tablename__ = "ingredientes"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    unidad = Column(String(30), nullable=False)
    stock_actual = Column(Numeric(10,3), nullable=False, default=0, CheckConstraint("stock_actual >= 0"))
    stock_minimo = Column(Numeric(10,3), nullable=False, default=0, CheckConstraint("stock_minimo >= 0"))
    costo_unitario = Column(Numeric(10,2), nullable=False, default=0, CheckConstraint("costo_unitario >= 0"))

    productos = relationship("ProductoIngrediente", back_populates="ingrediente")
    compras = relationship("CompraSuministro", back_populates="ingrediente")


class ProductoIngrediente(Base):
    __tablename__ = "producto_ingrediente"
    id_producto = Column(Integer, ForeignKey("productos.id", ondelete="CASCADE"), primary_key=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id", ondelete="CASCADE"), primary_key=True)
    cantidad = Column(Numeric(10,3), nullable=False, CheckConstraint("cantidad > 0"))

    producto = relationship("Producto", back_populates="ingredientes")
    ingrediente = relationship("Ingrediente", back_populates="productos")


class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True)
    id_mesa = Column(Integer, ForeignKey("mesas.id"), nullable=False)
    id_mesero = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_estado_actual = Column(Integer, ForeignKey("estados_pedido.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    mesa = relationship("Mesa", back_populates="pedidos")
    mesero = relationship("Usuario", foreign_keys=[id_mesero], back_populates="pedidos_mesero")
    estado = relationship("EstadoPedido", foreign_keys=[id_estado_actual], back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")
    historial = relationship("HistorialEstadoPedido", back_populates="pedido", cascade="all, delete-orphan")
    venta = relationship("Venta", back_populates="pedido", uselist=False)


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"
    id = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False, CheckConstraint("cantidad > 0"))
    precio_unitario = Column(Numeric(10,2), nullable=False, CheckConstraint("precio_unitario >= 0"))
    # subtotal es GENERATED ALWAYS, solo lectura
    subtotal = Column(Numeric(10,2))

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_pedido")
    observaciones = relationship("DetalleObservacion", back_populates="detalle", cascade="all, delete-orphan")


class DetalleObservacion(Base):
    __tablename__ = "detalle_observaciones"
    id = Column(Integer, primary_key=True)
    id_detalle = Column(Integer, ForeignKey("detalle_pedido.id", ondelete="CASCADE"), nullable=False)
    observacion = Column(String(255), nullable=False)

    detalle = relationship("DetallePedido", back_populates="observaciones")


class HistorialEstadoPedido(Base):
    __tablename__ = "historial_estados_pedido"
    id = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    id_estado_origen = Column(Integer, ForeignKey("estados_pedido.id"))
    id_estado_destino = Column(Integer, ForeignKey("estados_pedido.id"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    cambiado_en = Column(DateTime, nullable=False, default=datetime.now)

    pedido = relationship("Pedido", back_populates="historial")
    estado_origen = relationship("EstadoPedido", foreign_keys=[id_estado_origen], back_populates="historial_origen")
    estado_destino = relationship("EstadoPedido", foreign_keys=[id_estado_destino], back_populates="historial_destino")
    usuario = relationship("Usuario", back_populates="historial_cambios")


class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id"), nullable=False, unique=True)
    id_cajero = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_metodo_pago = Column(Integer, ForeignKey("metodos_pago.id"), nullable=False)
    monto_total = Column(Numeric(10,2), nullable=False, CheckConstraint("monto_total >= 0"))
    monto_recibido = Column(Numeric(10,2))
    fecha = Column(DateTime, nullable=False, default=datetime.now)

    pedido = relationship("Pedido", back_populates="venta")
    cajero = relationship("Usuario", foreign_keys=[id_cajero], back_populates="ventas_cajero")
    metodo_pago = relationship("MetodoPago", back_populates="ventas")

    @property
    def cambio(self):
        if self.monto_recibido is not None and self.monto_total is not None:
            return self.monto_recibido - self.monto_total
        return None


class Gasto(Base):
    __tablename__ = "gastos"
    id = Column(Integer, primary_key=True)
    descripcion = Column(String(255), nullable=False)
    monto = Column(Numeric(10,2), nullable=False, CheckConstraint("monto > 0"))
    id_categoria = Column(Integer, ForeignKey("categorias.id"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(Date, nullable=False, default=datetime.now().date)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

    categoria = relationship("Categoria", back_populates="gastos")
    usuario = relationship("Usuario", back_populates="gastos")


class CompraSuministro(Base):
    __tablename__ = "compras_suministros"
    id = Column(Integer, primary_key=True)
    id_ingrediente = Column(Integer, ForeignKey("ingredientes.id"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    cantidad = Column(Numeric(10,3), nullable=False, CheckConstraint("cantidad > 0"))
    costo_total = Column(Numeric(10,2), nullable=False, CheckConstraint("costo_total >= 0"))
    fecha = Column(Date, nullable=False, default=datetime.now().date)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

    ingrediente = relationship("Ingrediente", back_populates="compras")
    usuario = relationship("Usuario", back_populates="compras")