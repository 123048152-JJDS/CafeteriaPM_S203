"""
Verifica si hay datos en la base de datos.
Uso: python scripts/check_db.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.models.table import Table

db = SessionLocal()

print("=" * 50)
print("VERIFICANDO BASE DE DATOS")
print("=" * 50)

usuarios = db.query(User).count()
print(f"Usuarios: {usuarios}")

from app.models.role import Role
roles = db.query(Role).count()
print(f"Roles: {roles}")

mesas = db.query(Table).count()
print(f"Mesas: {mesas}")

productos = db.query(Product).count()
print(f"Productos: {productos}")

estados = db.query(OrderStatus).count()
print(f"Estados de pedido: {estados}")
for e in db.query(OrderStatus).all():
    print(f"   - {e.id}: {e.nombre}")

pedidos = db.query(Order).count()
print(f"Pedidos: {pedidos}")

if pedidos > 0:
    print("\nÚltimos 5 pedidos:")
    for p in db.query(Order).order_by(Order.created_at.desc()).limit(5).all():
        estado = p.estado_actual.nombre if p.estado_actual else "Sin estado"
        mesa = p.mesa.numero if p.mesa else "N/A"
        print(f"   #{p.id} | Mesa {mesa} | {estado} | {p.created_at}")
else:
    print("\nNo hay pedidos. Ejecuta: python scripts/seed_demo_data.py")

db.close()