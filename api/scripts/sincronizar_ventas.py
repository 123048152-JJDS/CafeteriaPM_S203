"""
Script utilitario para sincronizar y crear ventas de pedidos en estado 'pagado' que carecen de registro en la tabla 'ventas'.
Uso: python scripts/sincronizar_ventas.py
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.order import Order, OrderStatus
from app.models.sale import Sale, PaymentMethod
from app.models.user import User

def sincronizar_ventas():
    db = SessionLocal()
    try:
        estado_pagado = db.query(OrderStatus).filter(OrderStatus.nombre == "pagado").first()
        if not estado_pagado:
            print("[ERROR] No se encontró el estado 'pagado' en la tabla estados_pedido.")
            return

        metodo_defecto = db.query(PaymentMethod).first()
        metodo_id = metodo_defecto.id if metodo_defecto else 1

        pedidos_pagados = db.query(Order).filter(Order.id_estado_actual == estado_pagado.id).all()
        print(f"[INFO] Total de pedidos en estado 'pagado': {len(pedidos_pagados)}")

        creadas = 0
        for pedido in pedidos_pagados:
            if not pedido.venta:
                cajero_id = pedido.id_mesero
                total = sum(float(d.subtotal or 0) for d in pedido.detalles)
                
                venta = Sale(
                    id_pedido=pedido.id,
                    id_cajero=cajero_id,
                    id_metodo_pago=metodo_id,
                    monto_total=total,
                    monto_recibido=total,
                    fecha=pedido.updated_at or pedido.created_at
                )
                db.add(venta)
                creadas += 1

        if creadas > 0:
            db.commit()
            print(f"[ÉXITO] Se crearon y sincronizaron {creadas} registro(s) de ventas en la base de datos.")
        else:
            print("[INFO] Todos los pedidos pagados ya contaban con su registro de venta.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Ocurrió un error al sincronizar las ventas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sincronizar_ventas()
