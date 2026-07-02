from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import io
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.sale import Sale
from app.models.order import Order, OrderDetail, OrderStatus
from app.models.product import Product
from app.models.ingredient import Ingredient
from app.models.user import User
from app.schemas.stats import DashboardStats, ProductoVendido, VentaPorPeriodo

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), _=Depends(require_roles("admin", "caja"))):
    hoy = datetime.now().date()
    inicio_hoy = datetime(hoy.year, hoy.month, hoy.day)

    # Ventas de hoy
    ventas_hoy = db.query(func.sum(Sale.monto_total)).filter(
        Sale.fecha >= inicio_hoy
    ).scalar() or 0

    # Pedidos activos (no pagados, no cancelados)
    estados_activos = db.query(OrderStatus).filter(
        OrderStatus.nombre.in_(["pendiente", "en_preparacion", "listo", "entregado"])
    ).all()
    ids_activos = [e.id for e in estados_activos]
    pedidos_activos = db.query(Order).filter(Order.id_estado_actual.in_(ids_activos)).count()

    # Ingredientes con stock bajo
    stock_bajo = db.query(Ingredient).filter(
        Ingredient.stock_actual <= Ingredient.stock_minimo
    ).count()

    # Gastos de hoy
    gastos_hoy = db.query(func.sum(Expense.monto)).filter(
        Expense.fecha == hoy
    ).scalar() or 0

    # Productos más vendidos (top 5) en los últimos 30 días
    hace_30_dias = datetime.now() - timedelta(days=30)
    top_productos = db.query(
        Product.id,
        Product.nombre,
        func.sum(OrderDetail.cantidad).label("total_vendido")
    ).join(OrderDetail.producto).join(Order).filter(
        Order.id_estado_actual == db.query(OrderStatus).filter(OrderStatus.nombre == "pagado").first().id,
        Order.created_at >= hace_30_dias
    ).group_by(Product.id).order_by(func.sum(OrderDetail.cantidad).desc()).limit(5).all()

    return DashboardStats(
        ventas_hoy=float(ventas_hoy),
        pedidos_activos=pedidos_activos,
        stock_bajo=stock_bajo,
        gastos_hoy=float(gastos_hoy),
        productos_mas_vendidos=[ProductoVendido(
            id=p.id,
            nombre=p.nombre,
            total_vendido=int(p.total_vendido or 0)
        ) for p in top_productos]
    )


@router.get("/productos-mas-vendidos", response_model=List[ProductoVendido])
def get_productos_mas_vendidos(
    limit: int = 10,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    estado_pagado = db.query(OrderStatus).filter(OrderStatus.nombre == "pagado").first()
    if not estado_pagado:
        return []
    hace_30_dias = datetime.now() - timedelta(days=30)
    results = db.query(
        Product.id,
        Product.nombre,
        func.sum(OrderDetail.cantidad).label("total_vendido")
    ).join(OrderDetail.producto).join(Order).filter(
        Order.id_estado_actual == estado_pagado.id,
        Order.created_at >= hace_30_dias
    ).group_by(Product.id).order_by(func.sum(OrderDetail.cantidad).desc()).limit(limit).all()
    
    return [ProductoVendido(
        id=p.id,
        nombre=p.nombre,
        total_vendido=int(p.total_vendido or 0)
    ) for p in results]


@router.get("/reporte-ventas/pdf")
def reporte_ventas_pdf(db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    """Genera un PDF con el reporte de ventas del último mes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    flowables = []

    # Título
    title = Paragraph("Reporte de Ventas - Cafetería", styles['Title'])
    flowables.append(title)
    flowables.append(Spacer(1, 0.2*inch))

    # Fecha
    hoy = datetime.now().strftime("%Y-%m-%d %H:%M")
    fecha = Paragraph(f"Generado: {hoy}", styles['Normal'])
    flowables.append(fecha)
    flowables.append(Spacer(1, 0.2*inch))

    # Datos
    hace_30_dias = datetime.now() - timedelta(days=30)
    ventas = db.query(Sale).filter(Sale.fecha >= hace_30_dias).all()
    
    data = [["ID Venta", "Pedido", "Cajero", "Método", "Monto", "Fecha"]]
    total = 0
    for v in ventas:
        data.append([
            str(v.id),
            str(v.id_pedido),
            v.cajero.nombre if v.cajero else "N/A",
            v.metodo_pago.nombre if v.metodo_pago else "N/A",
            f"${float(v.monto_total):.2f}",
            v.fecha.strftime("%Y-%m-%d %H:%M")
        ])
        total += float(v.monto_total)
    data.append(["", "", "", "TOTAL", f"${total:.2f}", ""])

    tabla = Table(data, colWidths=[0.8*inch]*6)
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,-1), (-1,-1), colors.lightgrey),
        ('GRID', (0,0), (-1,-2), 1, colors.black),
    ]))
    flowables.append(tabla)
    flowables.append(Spacer(1, 0.2*inch))

    # Total en texto
    total_text = Paragraph(f"<b>Total recaudado (último mes): ${total:.2f}</b>", styles['Normal'])
    flowables.append(total_text)

    doc.build(flowables)
    buffer.seek(0)
    return Response(buffer.getvalue(), media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=reporte_ventas.pdf"
    })


@router.get("/reporte-ventas/xlsx")
def reporte_ventas_xlsx(db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    """Genera un archivo Excel con el reporte de ventas del último mes."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Ventas"

    # Encabezados
    headers = ["ID Venta", "Pedido", "Cajero", "Método Pago", "Monto", "Fecha"]
    ws.append(headers)

    hace_30_dias = datetime.now() - timedelta(days=30)
    ventas = db.query(Sale).filter(Sale.fecha >= hace_30_dias).all()
    total = 0
    for v in ventas:
        ws.append([
            v.id,
            v.id_pedido,
            v.cajero.nombre if v.cajero else "N/A",
            v.metodo_pago.nombre if v.metodo_pago else "N/A",
            float(v.monto_total),
            v.fecha.strftime("%Y-%m-%d %H:%M")
        ])
        total += float(v.monto_total)
    
    # Total
    ws.append([])
    ws.append(["TOTAL", "", "", "", total, ""])

    # Autoajustar columnas
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 30)
        ws.column_dimensions[column].width = adjusted_width

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return Response(buffer.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
        "Content-Disposition": "attachment; filename=reporte_ventas.xlsx"
    })