import io
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import cast, String
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.order import Order, OrderDetail, OrderDetailObservation, OrderStatus, OrderStatusHistory
from app.models.table import Table
from app.models.product import Product
from app.models.user import User
from app.services.inventario import descontar_ingredientes
from app.schemas.order import (
    OrderOut, OrderDetailOut, OrderCreate, OrderDetailCreate,
    OrderStatusChange, OrderStatusOut, OrderDetailUpdate
)

router = APIRouter()

@router.get("/estados", response_model=List[OrderStatusOut])
def get_estados(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(OrderStatus).all()

@router.get("/", response_model=List[OrderOut])
def get_pedidos(
    estado_id: Optional[int] = None,
    mesa_id: Optional[int] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    busqueda: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        q = db.query(Order).options(
            joinedload(Order.detalles).joinedload(OrderDetail.observaciones)
        )
        
        if estado_id:
            q = q.filter(Order.id_estado_actual == estado_id)
        if mesa_id:
            q = q.filter(Order.id_mesa == mesa_id)
        if fecha_inicio:
            try:
                fecha_dt = datetime.fromisoformat(fecha_inicio)
                q = q.filter(Order.created_at >= fecha_dt)
            except ValueError:
                pass
        if fecha_fin:
            try:
                fecha_dt = datetime.fromisoformat(fecha_fin) + timedelta(days=1)
                q = q.filter(Order.created_at < fecha_dt)
            except ValueError:
                pass
        if busqueda:
            if busqueda.isdigit():
                q = q.filter(Order.id == int(busqueda))
            else:
                q = q.join(Table, Order.id_mesa == Table.id).filter(
                    cast(Table.numero, String).ilike(f"%{busqueda}%")
                )

        q = q.order_by(Order.id.desc())

        if limit is not None:
            q = q.limit(limit)
        if offset is not None:
            q = q.offset(offset)

        resultado = q.all()
        print(f"[DEBUG] Pedidos obtenidos: {len(resultado)}")

        for pedido in resultado:
            total = 0.0
            for detalle in pedido.detalles:
                total += float(detalle.precio_unitario) * detalle.cantidad
            pedido.total = total

        return resultado

    except Exception as e:
        print(f"[ERROR] en get_pedidos: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno: {type(e).__name__}: {str(e)}"
        )

@router.get("/cola-cocina", response_model=List[OrderOut])
def get_cola_cocina(db: Session = Depends(get_db), _=Depends(get_current_user)):
    estados = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion"])
    ).all()
    ids = [e.id for e in estados]
    return db.query(Order).filter(Order.id_estado_actual.in_(ids)).order_by(
        Order.created_at.asc()
    ).all()

@router.get("/{pedido_id}", response_model=OrderOut)
def get_pedido(pedido_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")

    total = 0.0
    for detalle in pedido.detalles:
        total += float(detalle.precio_unitario) * detalle.cantidad
    pedido.total = total

    return pedido

@router.post("/", response_model=OrderOut, status_code=201)
def create_pedido(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("mesero", "admin"))
):
    mesa = db.query(Table).filter(Table.id == data.id_mesa).first()
    if not mesa:
        raise HTTPException(400, "Mesa no encontrada")

    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    pedido_existente = db.query(Order).filter(
        Order.id_mesa == data.id_mesa,
        Order.id_estado_actual.in_(ids_activos)
    ).first()
    if pedido_existente:
        raise HTTPException(
            400,
            f"La mesa ya tiene un pedido activo (#{pedido_existente.id}). Usa 'Editar pedido' en lugar de crear uno nuevo."
        )

    estado_pendiente = db.query(OrderStatus).filter(
        OrderStatus.nombre == "pendiente"
    ).first()
    if not estado_pendiente:
        raise HTTPException(500, "Estado 'pendiente' no configurado en BD")

    pedido = Order(
        id_mesa=data.id_mesa,
        id_mesero=current_user.id,
        id_estado_actual=estado_pendiente.id,
    )
    db.add(pedido)
    db.flush()

    for item in data.detalles:
        producto = db.query(Product).filter(Product.id == item.id_producto).first()
        if not producto:
            raise HTTPException(400, f"Producto ID {item.id_producto} no existe")
        if not producto.disponible:
            raise HTTPException(400, f"Producto '{producto.nombre}' no está disponible")

        precio_unitario = float(producto.precio)
        detalle = OrderDetail(
            id_pedido=pedido.id,
            id_producto=item.id_producto,
            cantidad=item.cantidad,
            precio_unitario=precio_unitario,
        )
        db.add(detalle)
        db.flush()

        if item.observacion:
            obs = OrderDetailObservation(
                id_detalle=detalle.id,
                observacion=item.observacion
            )
            db.add(obs)

    historial = OrderStatusHistory(
        id_pedido=pedido.id,
        id_estado_origen=None,
        id_estado_destino=estado_pendiente.id,
        id_usuario=current_user.id,
    )
    db.add(historial)

    db.commit()
    db.refresh(pedido)
    return pedido


@router.patch("/{pedido_id}/estado", response_model=OrderOut)
def cambiar_estado(
    pedido_id: int,
    data: OrderStatusChange,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")

    estado_nuevo = db.query(OrderStatus).filter(
        OrderStatus.id == data.id_estado_nuevo
    ).first()
    if not estado_nuevo:
        raise HTTPException(400, "Estado destino no válido")

    estado_actual_nombre = pedido.estado_actual.nombre
    estado_nuevo_nombre = estado_nuevo.nombre

    if estado_nuevo_nombre == "cancelado":
        pass
    else:
        transiciones = {
            "pendiente": ["en_preparacion", "cancelado"],
            "en_preparacion": ["listo", "cancelado"],
            "listo": ["entregado", "pagado", "cancelado"],
            "entregado": ["pagado"],
            "pagado": [],
        }
        if estado_nuevo_nombre not in transiciones.get(estado_actual_nombre, []):
            raise HTTPException(
                400,
                f"No se puede cambiar de '{estado_actual_nombre}' a '{estado_nuevo_nombre}'"
            )

    if estado_nuevo_nombre == "listo":
        descontar_ingredientes(db, pedido.id)

    pedido.id_estado_actual = estado_nuevo.id
    pedido.updated_at = datetime.now()

    historial = OrderStatusHistory(
        id_pedido=pedido.id,
        id_estado_origen=pedido.estado_actual.id if pedido.estado_actual else None,
        id_estado_destino=estado_nuevo.id,
        id_usuario=current_user.id,
    )
    db.add(historial)
    db.commit()
    db.refresh(pedido)
    return pedido

@router.delete("/{pedido_id}", status_code=204)
def delete_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    if pedido.estado_actual.nombre != "cancelado":
        raise HTTPException(400, "Solo se pueden eliminar pedidos cancelados")
    try:
        db.delete(pedido)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el pedido porque tiene una venta asociada."
        )

@router.get("/{pedido_id}/ticket/pdf")
def generar_ticket_pdf(
    pedido_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "caja", "mesero"))
):
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    import io

    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("CafeteriaPM - Ticket de Venta", styles['Title']))
    elements.append(Spacer(1, 0.2 * inch))

    info = f"<b>Pedido #{pedido.id}</b> | Mesa {pedido.mesa.numero if pedido.mesa else 'N/A'} | Fecha: {pedido.created_at.strftime('%d/%m/%Y %H:%M')}"
    elements.append(Paragraph(info, styles['Normal']))
    elements.append(Spacer(1, 0.1 * inch))

    data = [["Cant", "Producto", "Precio", "Subtotal"]]
    total = 0.0
    for detalle in pedido.detalles:
        subtotal = float(detalle.precio_unitario) * detalle.cantidad
        total += subtotal
        data.append([
            str(detalle.cantidad),
            detalle.producto.nombre if detalle.producto else "N/A",
            f"${float(detalle.precio_unitario):.2f}",
            f"${subtotal:.2f}"
        ])
    data.append(["", "", "TOTAL", f"${total:.2f}"])

    tabla = Table(data)
    tabla.setStyle(TableStyle([
        ('COLWIDTH', (0, 0), (0, -1), 0.8 * inch),
        ('COLWIDTH', (1, 0), (1, -1), 2.5 * inch),
        ('COLWIDTH', (2, 0), (2, -1), 1.2 * inch),
        ('COLWIDTH', (3, 0), (3, -1), 1.2 * inch),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -2), 1, colors.black),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(tabla)
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph("¡Gracias por su visita!", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)

    return Response(
        buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ticket_pedido_{pedido_id}.pdf"}
    )

ESTADOS_EDITABLES = ["pendiente", "en_preparacion"]


def _validar_pedido_editable(pedido: Order):
    if pedido.estado_actual.nombre not in ESTADOS_EDITABLES:
        raise HTTPException(
            400,
            f"No se pueden modificar los productos de un pedido en estado '{pedido.estado_actual.nombre}'."
        )


def _recalcular_total(pedido: Order) -> Order:
    pedido.total = sum(float(d.precio_unitario) * d.cantidad for d in pedido.detalles)
    return pedido


@router.post("/{pedido_id}/detalles", response_model=OrderOut, status_code=201)
def agregar_detalle(
    pedido_id: int,
    data: OrderDetailCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("mesero", "admin"))
):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    _validar_pedido_editable(pedido)

    producto = db.query(Product).filter(Product.id == data.id_producto).first()
    if not producto:
        raise HTTPException(400, f"Producto ID {data.id_producto} no existe")
    if not producto.disponible:
        raise HTTPException(400, f"Producto '{producto.nombre}' no está disponible")

    existente = next((d for d in pedido.detalles if d.id_producto == data.id_producto), None)
    if existente:
        existente.cantidad += data.cantidad
    else:
        detalle = OrderDetail(
            id_pedido=pedido.id,
            id_producto=data.id_producto,
            cantidad=data.cantidad,
            precio_unitario=float(producto.precio),
        )
        db.add(detalle)
        db.flush()
        if data.observacion:
            db.add(OrderDetailObservation(id_detalle=detalle.id, observacion=data.observacion))

    db.commit()
    db.refresh(pedido)
    return _recalcular_total(pedido)


@router.patch("/{pedido_id}/detalles/{detalle_id}", response_model=OrderOut)
def actualizar_detalle(
    pedido_id: int,
    detalle_id: int,
    data: OrderDetailUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("mesero", "admin"))
):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    _validar_pedido_editable(pedido)

    detalle = db.query(OrderDetail).filter(
        OrderDetail.id == detalle_id, OrderDetail.id_pedido == pedido_id
    ).first()
    if not detalle:
        raise HTTPException(404, "Detalle no encontrado en este pedido")

    if data.cantidad is not None:
        if data.cantidad <= 0:
            if len(pedido.detalles) <= 1:
                raise HTTPException(400, "No puedes vaciar el último producto. Cancela el pedido en su lugar.")
            db.delete(detalle)
        else:
            detalle.cantidad = data.cantidad

    db.commit()
    db.refresh(pedido)
    return _recalcular_total(pedido)


@router.delete("/{pedido_id}/detalles/{detalle_id}", response_model=OrderOut)
def eliminar_detalle(
    pedido_id: int,
    detalle_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("mesero", "admin"))
):
    pedido = db.query(Order).filter(Order.id == pedido_id).first()
    if not pedido:
        raise HTTPException(404, "Pedido no encontrado")
    _validar_pedido_editable(pedido)

    detalle = db.query(OrderDetail).filter(
        OrderDetail.id == detalle_id, OrderDetail.id_pedido == pedido_id
    ).first()
    if not detalle:
        raise HTTPException(404, "Detalle no encontrado en este pedido")

    if len(pedido.detalles) <= 1:
        raise HTTPException(400, "No puedes eliminar el último producto. Cancela el pedido en su lugar.")

    db.delete(detalle)
    db.commit()
    db.refresh(pedido)
    return _recalcular_total(pedido)