from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.order import Order, OrderDetail
from app.models.product import ProductIngredient
from app.models.ingredient import Ingredient


def descontar_ingredientes(db: Session, pedido_id: int) -> None:
    """
    Descuenta los ingredientes del inventario según los productos del pedido.
    Lanza HTTPException 400 si algún ingrediente no tiene stock suficiente.
    """
    detalles = db.query(OrderDetail).filter(OrderDetail.id_pedido == pedido_id).all()
    if not detalles:
        return

    # 1. Recolectar todos los ingredientes necesarios
    #    { id_ingrediente: cantidad_total_necesaria }
    requerimientos = {}
    for detalle in detalles:
        # Obtener los ingredientes de este producto
        for pi in detalle.producto.ingredientes:
            ing_id = pi.id_ingrediente
            cantidad_necesaria = float(pi.cantidad) * detalle.cantidad
            requerimientos[ing_id] = requerimientos.get(ing_id, 0) + cantidad_necesaria

    if not requerimientos:
        return

    actualizaciones = []
    for ing_id, cantidad_requerida in requerimientos.items():
        ingrediente = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
        if not ingrediente:
            raise HTTPException(400, f"Ingrediente ID {ing_id} no encontrado")
        
        stock_actual = float(ingrediente.stock_actual)
        if stock_actual < cantidad_requerida:
            raise HTTPException(
                400, 
                f"Stock insuficiente para '{ingrediente.nombre}'. "
                f"Disponible: {stock_actual} {ingrediente.unidad}, "
                f"Necesario: {cantidad_requerida} {ingrediente.unidad}"
            )
        actualizaciones.append((ingrediente, cantidad_requerida))

    # 3. Ejecutar descuentos
    for ingrediente, cantidad in actualizaciones:
        ingrediente.stock_actual = float(ingrediente.stock_actual) - cantidad

    db.flush() 