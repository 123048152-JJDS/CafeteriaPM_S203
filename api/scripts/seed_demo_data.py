"""
Script para generar datos de demostración: usuarios, mesas, pedidos, ventas, gastos y compras.
Ejecutar después de los seeds base (seed_admin, seed_estados, seed_productos).
Uso: python scripts/seed_demo_data.py
"""
import sys
import os
from datetime import datetime, timedelta, date
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.role import Role
from app.models.table import Table
from app.models.order import Order, OrderStatus, OrderDetail, OrderStatusHistory
from app.models.product import Product
from app.models.sale import Sale, PaymentMethod
from app.models.expense import Expense, Purchase
from app.models.ingredient import Ingredient
from app.models.product import Category

NUM_MESAS = 10
NUM_MESEROS = 3
NUM_COCINEROS = 2
NUM_CAJEROS = 2
NUM_PEDIDOS = 25
DIAS_ATRAS = 7  

def get_or_create_role(db, nombre):
    role = db.query(Role).filter(Role.nombre == nombre).first()
    if not role:
        role = Role(nombre=nombre, descripcion=f"Rol {nombre}")
        db.add(role)
        db.commit()
        db.refresh(role)
    return role

def get_or_create_user(db, nombre, email, password, rol_nombre):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    role = db.query(Role).filter(Role.nombre == rol_nombre).first()
    if not role:
        role = get_or_create_role(db, rol_nombre)
    user = User(
        nombre=nombre,
        email=email,
        password_hash=hash_password(password),
        id_rol=role.id,
        activo=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_or_create_table(db, numero, capacidad):
    table = db.query(Table).filter(Table.numero == numero).first()
    if table:
        return table
    table = Table(numero=numero, capacidad=capacidad)
    db.add(table)
    db.commit()
    db.refresh(table)
    return table

def seed_demo_data():
    db = SessionLocal()
    try:
        print("Generando datos de demostración...")
        print("Creando usuarios...")
        
        meseros = [
            ("Ana García", "ana@cafe.com", "mesero123", "mesero"),
            ("Luis Martínez", "luis@cafe.com", "mesero123", "mesero"),
            ("Marta Rodríguez", "marta@cafe.com", "mesero123", "mesero"),
        ]
        for nombre, email, pwd, rol in meseros:
            get_or_create_user(db, nombre, email, pwd, rol)

        cocineros = [
            ("Carlos Sánchez", "carlos@cafe.com", "cocina123", "cocina"),
            ("Elena Pérez", "elena@cafe.com", "cocina123", "cocina"),
        ]
        for nombre, email, pwd, rol in cocineros:
            get_or_create_user(db, nombre, email, pwd, rol)

        cajeros = [
            ("Juan Fernández", "juan@cafe.com", "caja123", "caja"),
            ("Laura Gómez", "laura@cafe.com", "caja123", "caja"),
        ]
        for nombre, email, pwd, rol in cajeros:
            get_or_create_user(db, nombre, email, pwd, rol)

        print(f"Usuarios creados: {len(meseros) + len(cocineros) + len(cajeros)}")

        print("Creando mesas...")
        mesas = []
        for i in range(1, NUM_MESAS + 1):
            capacidad = random.choice([2, 4, 4, 6, 8])
            mesa = get_or_create_table(db, i, capacidad)
            mesas.append(mesa)
        print(f"   {len(mesas)} mesas creadas")

        print("Creando pedidos...")
        estados = {e.nombre: e for e in db.query(OrderStatus).all()}
        productos = db.query(Product).filter(Product.disponible == True).all()
        usuarios_mesero = db.query(User).join(Role).filter(Role.nombre == "mesero").all()
        usuarios_cocina = db.query(User).join(Role).filter(Role.nombre == "cocina").all()
        usuarios_caja = db.query(User).join(Role).filter(Role.nombre == "caja").all()

        if not productos:
            print("No hay productos. Ejecuta seed_productos.py primero.")
            return
        if not estados:
            print("No hay estados. Ejecuta seed_estados.py primero.")
            return

        pedidos_creados = 0
        hoy = date.today()

        for i in range(NUM_PEDIDOS):
            mesa = random.choice(mesas)
            mesero = random.choice(usuarios_mesero)

            dias_atras = random.randint(0, DIAS_ATRAS)
            fecha_creacion = datetime.combine(hoy - timedelta(days=dias_atras), datetime.min.time()) + timedelta(
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59)
            )

            rand = random.random()
            if rand < 0.20:
                estado_nombre = "pendiente"
                estado_obj = estados.get("pendiente")
            elif rand < 0.50:
                estado_nombre = "en_preparacion"
                estado_obj = estados.get("en_preparacion")
            elif rand < 0.70:
                estado_nombre = "listo"
                estado_obj = estados.get("listo")
            else:
                estado_nombre = "pagado"
                estado_obj = estados.get("pagado")

            if not estado_obj:
                continue

            pedido = Order(
                id_mesa=mesa.id,
                id_mesero=mesero.id,
                id_estado_actual=estado_obj.id,
                created_at=fecha_creacion,
                updated_at=fecha_creacion
            )
            db.add(pedido)
            db.flush()

            num_items = random.randint(1, 5)
            productos_seleccionados = random.sample(productos, min(num_items, len(productos)))
            for prod in productos_seleccionados:
                cantidad = random.randint(1, 3)
                detalle = OrderDetail(
                    id_pedido=pedido.id,
                    id_producto=prod.id,
                    cantidad=cantidad,
                    precio_unitario=float(prod.precio)
                )
                db.add(detalle)
                db.flush()

            if estado_nombre in ["en_preparacion", "listo", "pagado"]:
                tiempo1 = fecha_creacion + timedelta(minutes=random.randint(2, 10))
                historial1 = OrderStatusHistory(
                    id_pedido=pedido.id,
                    id_estado_origen=estados.get("pendiente").id,
                    id_estado_destino=estados.get("en_preparacion").id,
                    id_usuario=random.choice(usuarios_cocina).id,
                    cambiado_en=tiempo1
                )
                db.add(historial1)

                if estado_nombre in ["listo", "pagado"]:
                    tiempo2 = tiempo1 + timedelta(minutes=random.randint(5, 20))
                    historial2 = OrderStatusHistory(
                        id_pedido=pedido.id,
                        id_estado_origen=estados.get("en_preparacion").id,
                        id_estado_destino=estados.get("listo").id,
                        id_usuario=random.choice(usuarios_cocina).id,
                        cambiado_en=tiempo2
                    )
                    db.add(historial2)

                    if estado_nombre == "pagado":
                        tiempo3 = tiempo2 + timedelta(minutes=random.randint(1, 10))
                        historial3 = OrderStatusHistory(
                            id_pedido=pedido.id,
                            id_estado_origen=estados.get("listo").id,
                            id_estado_destino=estados.get("pagado").id,
                            id_usuario=random.choice(usuarios_caja).id,
                            cambiado_en=tiempo3
                        )
                        db.add(historial3)
                        pedido.updated_at = tiempo3
                    else:
                        pedido.updated_at = tiempo2
                else:
                    pedido.updated_at = tiempo1
            else:
                pedido.updated_at = fecha_creacion

            db.commit()
            pedidos_creados += 1

            if estado_nombre == "pagado":
                metodos_pago = db.query(PaymentMethod).all()
                if metodos_pago:
                    metodo = random.choice(metodos_pago)
                    cajero = random.choice(usuarios_caja)
                    total = sum(float(d.subtotal or 0) for d in pedido.detalles)
                    monto_recibido = total if random.random() < 0.7 else total + random.randint(1, 50)
                    venta = Sale(
                        id_pedido=pedido.id,
                        id_cajero=cajero.id,
                        id_metodo_pago=metodo.id,
                        monto_total=total,
                        monto_recibido=monto_recibido,
                        fecha=pedido.updated_at
                    )
                    db.add(venta)
                    db.commit()

        print(f"{pedidos_creados} pedidos creados")

        print(" Creando gastos...")
        categorias_gasto = db.query(Category).filter(Category.tipo.in_(["gasto", "ambos"])).all()
        usuarios = db.query(User).all()
        gastos_creados = 0
        for _ in range(10):
            descripciones = [
                "Compra de leche", "Compra de café", "Pago de luz",
                "Compra de pan", "Compra de azúcar", "Mantenimiento",
                "Compra de harina", "Pago de agua", "Compra de queso",
                "Compra de jamón", "Compra de crema", "Pago de internet"
            ]
            gasto = Expense(
                descripcion=random.choice(descripciones),
                monto=round(random.uniform(50, 500), 2),
                id_categoria=random.choice(categorias_gasto).id if categorias_gasto else None,
                id_usuario=random.choice(usuarios).id,
                fecha=date.today() - timedelta(days=random.randint(0, DIAS_ATRAS))
            )
            db.add(gasto)
            db.commit()
            gastos_creados += 1
        print(f"{gastos_creados} gastos creados")

        print("Creando compras de suministros...")
        ingredientes = db.query(Ingredient).all()
        usuarios = db.query(User).all()
        compras_creadas = 0
        for _ in range(15):
            ing = random.choice(ingredientes) if ingredientes else None
            if not ing:
                break
            cantidad = round(random.uniform(1, 10), 1)
            costo_total = round(cantidad * float(ing.costo_unitario or 10), 2)
            compra = Purchase(
                id_ingrediente=ing.id,
                id_usuario=random.choice(usuarios).id,
                cantidad=cantidad,
                costo_total=costo_total,
                fecha=date.today() - timedelta(days=random.randint(0, DIAS_ATRAS))
            )
            db.add(compra)
            db.commit()
            compras_creadas += 1
        print(f"{compras_creadas} compras creadas")

        print("\nDatos de demostración generados exitosamente!")
        print(f"   - Usuarios: {len(usuarios)}")
        print(f"   - Mesas: {len(mesas)}")
        print(f"   - Pedidos: {pedidos_creados}")
        print(f"   - Gastos: {gastos_creados}")
        print(f"   - Compras: {compras_creadas}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()