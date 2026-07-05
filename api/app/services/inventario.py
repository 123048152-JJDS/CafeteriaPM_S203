from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.order import Order, OrderDetail
from app.models.product import ProductIngredient
from app.models.ingredient import Ingredient

def descontar_ingredientes(db: Session, pedido_id: int) -> None:
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, f"Pedido ID {pedido_id} no encontrado")
    detalles = db.query(OrderDetail).filter(OrderDetail.id_pedido == pedido_id).all()
    if not detalles:
        raise HTTPException(404, f"Detalles del pedido ID {pedido_id} no encontrados")

    requerimientos = {}
    for detalle in detalles:
        for pi in detalle.producto.ingredientes:
            ing_id = pi.id_ingrediente
            cantidad_necesaria = float(pi.cantidad) * detalle.cantidad
            requerimientos[ing_id] = requerimientos.get(ing_id, 0) + cantidad_necesaria

    if not requerimientos:
        raise HTTPException(404, f"Requerimientos para el pedido ID {pedido_id} no encontrados")

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

    for ingrediente, cantidad in actualizaciones:
        ingrediente.stock_actual = float(ingrediente.stock_actual) - cantidad

    db.flush() 