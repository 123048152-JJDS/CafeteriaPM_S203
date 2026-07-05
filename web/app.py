import os
import requests
from datetime import datetime
from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, Response
)
from functools import wraps

app = Flask(__name__)
app.secret_key = os.urandom(24)

API_BASE_URL = "http://localhost:8000"

@app.template_filter('format_date')
def format_date(value, format='%d/%m/%Y'):
    if not value:
        return ''
    if isinstance(value, datetime):
        return value.strftime(format)
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            return dt.strftime(format)
        except (ValueError, TypeError):
            return value
    return value

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'access_token' not in session:
            flash("Por favor, inicia sesión primero.", "warning")
            return redirect(url_for('login'))
        if session.get('user_role') != 'admin':
            flash("Acceso denegado. Solo administradores.", "danger")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def api_request(method, endpoint, data=None, json=None, params=None):
    headers = {"Authorization": f"Bearer {session.get('access_token')}"}
    url = f"{API_BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json or data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json or data)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=json or data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Método HTTP no soportado: {method}")
        return response
    except requests.exceptions.ConnectionError:
        flash("Error: No se pudo conectar con la API. ¿Está corriendo?", "danger")
        return None

@app.route("/", methods=["GET"])
def index():
    if 'access_token' in session and session.get('user_role') == 'admin':
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        if not email or not password:
            flash("Completa todos los campos", "warning")
            return render_template("login.html")
        try:
            res = requests.post(f"{API_BASE_URL}/auth/login", json={
                "email": email,
                "password": password
            })
            if res.status_code == 200:
                data = res.json()
                session['access_token'] = data['access_token']
                session['user_id'] = data['user_id']
                session['user_name'] = data['nombre']
                session['user_role'] = data['rol']
                if data['rol'] != 'admin':
                    flash("Acceso denegado. Solo administradores.", "danger")
                    session.clear()
                    return redirect(url_for('login'))
                flash(f"¡Bienvenido, {data['nombre']}!", "success")
                return redirect(url_for('dashboard'))
            else:
                flash("Credenciales incorrectas", "danger")
        except Exception as e:
            flash("Error de conexión con el servidor", "danger")
            print(f"[ERROR] {e}")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada correctamente", "info")
    return redirect(url_for('login'))

@app.route("/dashboard")
@login_required
def dashboard():
    res = api_request("GET", "/stats/dashboard")
    stats = {}
    productos = []
    if res and res.status_code == 200:
        stats = res.json()
        productos = stats.get("productos_mas_vendidos", [])
    else:
        flash("No se pudieron cargar las estadísticas", "warning")
    res_ventas = api_request("GET", "/stats/ventas-diarias?dias=7")
    ventas_diarias = res_ventas.json() if res_ventas and res_ventas.status_code == 200 else []
    return render_template(
        "dashboard.html",
        stats=stats,
        productos=productos,
        ventas_diarias=ventas_diarias,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/usuarios", methods=["GET", "POST"])
@login_required
def usuarios():
    busqueda = request.args.get('busqueda')
    rol_id = request.args.get('rol_id', type=int)
    activo = request.args.get('activo')
    params = {}
    if busqueda:
        params['search'] = busqueda
    if rol_id:
        params['rol_id'] = rol_id
    if activo is not None and activo != '':
        params['activo'] = activo.lower() == 'true'
    res_users = api_request("GET", "/usuarios/", params=params)
    res_roles = api_request("GET", "/usuarios/roles")
    users = res_users.json() if res_users and res_users.status_code == 200 else []
    roles = res_roles.json() if res_roles and res_roles.status_code == 200 else []
    if request.method == "POST":
        nombre = request.form.get("nombre")
        email = request.form.get("email")
        password = request.form.get("password")
        id_rol = request.form.get("id_rol")
        activo = request.form.get("activo") == "on"
        if not all([nombre, email, password, id_rol]):
            flash("Todos los campos son obligatorios", "warning")
        else:
            payload = {
                "nombre": nombre,
                "email": email,
                "password": password,
                "id_rol": int(id_rol),
                "activo": activo
            }
            res = api_request("POST", "/usuarios/", json=payload)
            if res and res.status_code == 201:
                flash("Usuario creado correctamente", "success")
                return redirect(url_for('usuarios'))
            else:
                error_msg = "Error al crear usuario."
                if res and res.status_code == 400:
                    error_msg = res.json().get("detail", error_msg)
                flash(error_msg, "danger")
    return render_template(
        "usuarios.html",
        users=users,
        roles=roles,
        busqueda_seleccionada=busqueda,
        rol_seleccionado=rol_id,
        estado_seleccionado=activo,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/usuarios/eliminar/<int:user_id>", methods=["POST"])
@login_required
def eliminar_usuario(user_id):
    res = api_request("DELETE", f"/usuarios/{user_id}")
    if res and res.status_code == 204:
        flash("Usuario eliminado correctamente", "success")
    else:
        flash("No se pudo eliminar el usuario", "danger")
    return redirect(url_for('usuarios'))

@app.route("/usuarios/editar/<int:user_id>", methods=["POST"])
@login_required
def editar_usuario(user_id):
    nombre = request.form.get("nombre")
    email = request.form.get("email")
    password = request.form.get("password")
    id_rol = request.form.get("id_rol")
    activo = request.form.get("activo") == "on"
    payload = {}
    if nombre:
        payload["nombre"] = nombre
    if email:
        payload["email"] = email
    if password:
        payload["password"] = password
    if id_rol:
        payload["id_rol"] = int(id_rol)
    payload["activo"] = activo
    res = api_request("PATCH", f"/usuarios/{user_id}", json=payload)
    if res and res.status_code == 200:
        flash("Usuario actualizado correctamente", "success")
    else:
        flash("Error al actualizar usuario", "danger")
    return redirect(url_for('usuarios'))

@app.route("/estadisticas")
@login_required
def estadisticas():
    tab = request.args.get('tab', 'ventas')
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    res_resumen = api_request("GET", "/stats/resumen-mes")
    resumen = res_resumen.json() if res_resumen and res_resumen.status_code == 200 else {}

    res_diarias = api_request("GET", "/stats/ventas-diarias?dias=7")
    ventas_diarias = res_diarias.json() if res_diarias and res_diarias.status_code == 200 else []

    res_gastos_diarios = api_request("GET", "/stats/gastos-diarios?dias=7")
    gastos_diarios = res_gastos_diarios.json() if res_gastos_diarios and res_gastos_diarios.status_code == 200 else []

    datos_tab = {}
    if tab == 'ventas':
        params = []
        if fecha_inicio:
            params.append(f"fecha_inicio={fecha_inicio}")
        if fecha_fin:
            params.append(f"fecha_fin={fecha_fin}")
        query = "&".join(params)
        endpoint = f"/stats/ventas-lista?{query}" if query else "/stats/ventas-lista"
        res = api_request("GET", endpoint)
        datos_tab['ventas'] = res.json() if res and res.status_code == 200 else []
    elif tab == 'gastos':
        params = []
        if fecha_inicio:
            params.append(f"fecha_inicio={fecha_inicio}")
        if fecha_fin:
            params.append(f"fecha_fin={fecha_fin}")
        query = "&".join(params)
        endpoint = f"/stats/gastos-lista?{query}" if query else "/stats/gastos-lista"
        res = api_request("GET", endpoint)
        datos_tab['gastos'] = res.json() if res and res.status_code == 200 else []
    elif tab == 'productos':
        res = api_request("GET", "/stats/productos-estadisticas")
        datos_tab = res.json() if res and res.status_code == 200 else {}
    elif tab == 'inventario':
        res = api_request("GET", "/stats/inventario-estado")
        datos_tab = res.json() if res and res.status_code == 200 else {}
    elif tab == 'historial':
        res = api_request("GET", "/stats/historial-actividad?limite=20")
        datos_tab = res.json() if res and res.status_code == 200 else {}

    # Construir URLs de descarga según la pestaña activa
    descargas = {}
    if tab == 'ventas':
        descargas = {
            'pdf': url_for('proxy_reporte_ventas_pdf', fecha_inicio=fecha_inicio, fecha_fin=fecha_fin),
            'xlsx': url_for('proxy_reporte_ventas_xlsx', fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
        }
    elif tab == 'gastos':
        descargas = {
            'pdf': url_for('proxy_reporte_gastos_pdf', fecha_inicio=fecha_inicio, fecha_fin=fecha_fin),
            'xlsx': url_for('proxy_reporte_gastos_xlsx', fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
        }
    elif tab == 'productos':
        descargas = {
            'pdf': url_for('proxy_reporte_productos_pdf'),
            'xlsx': url_for('proxy_reporte_productos_xlsx')
        }
    elif tab == 'inventario':
        descargas = {
            'pdf': url_for('proxy_reporte_inventario_pdf'),
            'xlsx': url_for('proxy_reporte_inventario_xlsx')
        }
    elif tab == 'historial':
        descargas = {
            'pdf': url_for('proxy_reporte_historial_pdf'),
            'xlsx': url_for('proxy_reporte_historial_xlsx')
        }

    return render_template(
        "estadisticas.html",
        tab_activa=tab,
        resumen=resumen,
        ventas_diarias=ventas_diarias,
        gastos_diarios=gastos_diarios,
        datos_tab=datos_tab,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        descargas=descargas,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

# ─── REPORTES POR PESTAÑA (CON FILTROS DE FECHA) ───

@app.route("/proxy/reporte-ventas/pdf")
@login_required
def proxy_reporte_ventas_pdf():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    params = {}
    if fecha_inicio:
        params['fecha_inicio'] = fecha_inicio
    if fecha_fin:
        params['fecha_fin'] = fecha_fin
    res = api_request("GET", "/stats/reporte-ventas/pdf", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_ventas.pdf"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='ventas'))

@app.route("/proxy/reporte-ventas/xlsx")
@login_required
def proxy_reporte_ventas_xlsx():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    params = {}
    if fecha_inicio:
        params['fecha_inicio'] = fecha_inicio
    if fecha_fin:
        params['fecha_fin'] = fecha_fin
    res = api_request("GET", "/stats/reporte-ventas/xlsx", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_ventas.xlsx"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='ventas'))

@app.route("/proxy/reporte-gastos/pdf")
@login_required
def proxy_reporte_gastos_pdf():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    params = {}
    if fecha_inicio:
        params['fecha_inicio'] = fecha_inicio
    if fecha_fin:
        params['fecha_fin'] = fecha_fin
    res = api_request("GET", "/stats/reporte-gastos/pdf", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_gastos.pdf"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='gastos'))

@app.route("/proxy/reporte-gastos/xlsx")
@login_required
def proxy_reporte_gastos_xlsx():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    params = {}
    if fecha_inicio:
        params['fecha_inicio'] = fecha_inicio
    if fecha_fin:
        params['fecha_fin'] = fecha_fin
    res = api_request("GET", "/stats/reporte-gastos/xlsx", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_gastos.xlsx"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='gastos'))

@app.route("/proxy/reporte-productos/pdf")
@login_required
def proxy_reporte_productos_pdf():
    categoria = request.args.get('categoria')
    disponible = request.args.get('disponible')
    params = {}
    if categoria:
        params['categoria_id'] = categoria
    if disponible is not None:
        params['disponible'] = disponible.lower() == 'true'
    res = api_request("GET", "/stats/reporte-productos/pdf", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_productos.pdf"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='productos'))

@app.route("/proxy/reporte-productos/xlsx")
@login_required
def proxy_reporte_productos_xlsx():
    categoria = request.args.get('categoria')
    disponible = request.args.get('disponible')
    params = {}
    if categoria:
        params['categoria_id'] = categoria
    if disponible is not None:
        params['disponible'] = disponible.lower() == 'true'
    res = api_request("GET", "/stats/reporte-productos/xlsx", params=params)
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_productos.xlsx"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='productos'))

@app.route("/proxy/reporte-inventario/pdf")
@login_required
def proxy_reporte_inventario_pdf():
    res = api_request("GET", "/stats/reporte-inventario/pdf")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_inventario.pdf"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='inventario'))

@app.route("/proxy/reporte-inventario/xlsx")
@login_required
def proxy_reporte_inventario_xlsx():
    res = api_request("GET", "/stats/reporte-inventario/xlsx")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_inventario.xlsx"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='inventario'))

@app.route("/proxy/reporte-historial/pdf")
@login_required
def proxy_reporte_historial_pdf():
    res = api_request("GET", "/stats/reporte-historial/pdf")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_historial.pdf"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='historial'))

@app.route("/proxy/reporte-historial/xlsx")
@login_required
def proxy_reporte_historial_xlsx():
    res = api_request("GET", "/stats/reporte-historial/xlsx")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_historial.xlsx"
        })
    flash("Error al generar el reporte", "danger")
    return redirect(url_for('estadisticas', tab='historial'))

@app.route("/pedidos")
@login_required
def pedidos():
    estado_id = request.args.get('estado_id', type=int)
    mesa_id = request.args.get('mesa_id', type=int)
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    busqueda = request.args.get('busqueda')
    params = {}
    if estado_id:
        params['estado_id'] = estado_id
    if mesa_id:
        params['mesa_id'] = mesa_id
    if fecha_inicio:
        params['fecha_inicio'] = fecha_inicio
    if fecha_fin:
        params['fecha_fin'] = fecha_fin
    if busqueda:
        params['busqueda'] = busqueda
    if not any([estado_id, mesa_id, fecha_inicio, fecha_fin, busqueda]):
        params['limit'] = 10
        mostrar_ultimos = True
    else:
        mostrar_ultimos = False
    res = api_request("GET", "/pedidos/", params=params)
    pedidos = res.json() if res and res.status_code == 200 else []
    res_estados = api_request("GET", "/pedidos/estados")
    estados = res_estados.json() if res_estados and res_estados.status_code == 200 else []
    return render_template(
        "pedidos.html",
        pedidos=pedidos,
        estados=estados,
        estado_seleccionado=estado_id,
        mesa_seleccionada=mesa_id,
        fecha_inicio_seleccionada=fecha_inicio,
        fecha_fin_seleccionada=fecha_fin,
        busqueda_seleccionada=busqueda,
        mostrar_ultimos=mostrar_ultimos,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/pedidos/cambiar-estado/<int:pedido_id>", methods=["POST"])
@login_required
def cambiar_estado_pedido(pedido_id):
    id_estado_nuevo = request.form.get("id_estado_nuevo", type=int)
    if not id_estado_nuevo:
        flash("Estado no especificado", "warning")
        return redirect(url_for('pedidos'))
    res = api_request("PATCH", f"/pedidos/{pedido_id}/estado", json={"id_estado_nuevo": id_estado_nuevo})
    if res and res.status_code == 200:
        flash("Estado actualizado correctamente", "success")
    else:
        error_msg = "Error al actualizar el estado"
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('pedidos'))

@app.route("/proxy/ticket/<int:pedido_id>/pdf")
@login_required
def proxy_ticket_pdf(pedido_id):
    res = api_request("GET", f"/pedidos/{pedido_id}/ticket/pdf")
    if res and res.status_code == 200:
        return Response(
            res.content,
            content_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ticket_pedido_{pedido_id}.pdf"}
        )
    flash("Error al generar el ticket", "danger")
    return redirect(url_for('pedidos'))

@app.route("/menu")
@login_required
def menu():
    disponible = request.args.get('disponible')
    endpoint = "/productos/"
    if disponible is not None:
        endpoint += f"?disponible={disponible}"
    res = api_request("GET", endpoint)
    productos = res.json() if res and res.status_code == 200 else []
    res_cat = api_request("GET", "/productos/categorias")
    categorias = res_cat.json() if res_cat and res_cat.status_code == 200 else []
    res_ing = api_request("GET", "/productos/ingredientes")
    ingredientes = res_ing.json() if res_ing and res_ing.status_code == 200 else []
    return render_template(
        "menu.html",
        productos=productos,
        categorias=categorias,
        ingredientes=ingredientes,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/productos/crear", methods=["POST"])
@login_required
def crear_producto():
    nombre = request.form.get("nombre")
    descripcion = request.form.get("descripcion")
    precio = request.form.get("precio")
    id_categoria = request.form.get("id_categoria")
    disponible = request.form.get("disponible") == "on"
    ingredientes_ids = request.form.getlist("ingredientes")
    if not nombre or not precio:
        flash("Nombre y precio son obligatorios", "warning")
        return redirect(url_for('menu'))
    ingredientes_payload = []
    for ing_id in ingredientes_ids:
        ingredientes_payload.append({
            "id_ingrediente": int(ing_id),
            "cantidad": 1.0
        })
    payload = {
        "nombre": nombre,
        "descripcion": descripcion or "",
        "precio": float(precio),
        "id_categoria": int(id_categoria) if id_categoria else None,
        "disponible": disponible,
        "imagen_url": None,
        "ingredientes": ingredientes_payload
    }
    res = api_request("POST", "/productos/", json=payload)
    if res and res.status_code == 201:
        flash("Producto creado correctamente", "success")
    else:
        error_msg = "Error al crear el producto."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('menu'))

@app.route("/productos/editar/<int:producto_id>", methods=["POST"])
@login_required
def editar_producto(producto_id):
    nombre = request.form.get("nombre")
    descripcion = request.form.get("descripcion")
    precio = request.form.get("precio")
    id_categoria = request.form.get("id_categoria")
    disponible = request.form.get("disponible") == "on"
    if not nombre or not precio:
        flash("Nombre y precio son obligatorios", "warning")
        return redirect(url_for('menu'))
    payload = {
        "nombre": nombre,
        "descripcion": descripcion or "",
        "precio": float(precio),
        "id_categoria": int(id_categoria) if id_categoria else None,
        "disponible": disponible,
    }
    res = api_request("PATCH", f"/productos/{producto_id}", json=payload)
    if res and res.status_code == 200:
        flash("Producto actualizado correctamente", "success")
    else:
        error_msg = "Error al actualizar el producto."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('menu'))

@app.route("/productos/eliminar/<int:producto_id>", methods=["POST"])
@login_required
def eliminar_producto(producto_id):
    res = api_request("DELETE", f"/productos/{producto_id}")
    if res and res.status_code == 204:
        flash("Producto eliminado correctamente", "success")
    else:
        flash("No se pudo eliminar el producto", "danger")
    return redirect(url_for('menu'))

@app.route("/productos/toggle/<int:producto_id>", methods=["POST"])
@login_required
def toggle_producto(producto_id):
    res = api_request("PATCH", f"/productos/{producto_id}/toggle")
    if res and res.status_code == 200:
        estado = "activado" if res.json().get("disponible") else "desactivado"
        flash(f"Producto {estado} correctamente", "success")
    else:
        flash("Error al cambiar el estado del producto", "danger")
    return redirect(url_for('menu'))

@app.route("/inventario")
@login_required
def inventario():
    res = api_request("GET", "/productos/ingredientes")
    ingredientes = res.json() if res and res.status_code == 200 else []
    res_bajo = api_request("GET", "/productos/ingredientes/stock-bajo")
    stock_bajo = res_bajo.json() if res_bajo and res_bajo.status_code == 200 else []
    return render_template(
        "inventario.html",
        ingredientes=ingredientes,
        stock_bajo=stock_bajo,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/inventario/editar/<int:ingrediente_id>", methods=["POST"])
@login_required
def editar_ingrediente(ingrediente_id):
    nombre = request.form.get("nombre")
    unidad = request.form.get("unidad")
    stock_actual = request.form.get("stock_actual")
    stock_minimo = request.form.get("stock_minimo")
    costo_unitario = request.form.get("costo_unitario")
    payload = {}
    if nombre:
        payload["nombre"] = nombre
    if unidad:
        payload["unidad"] = unidad
    if stock_actual is not None and stock_actual != '':
        payload["stock_actual"] = float(stock_actual)
    if stock_minimo is not None and stock_minimo != '':
        payload["stock_minimo"] = float(stock_minimo)
    if costo_unitario is not None and costo_unitario != '':
        payload["costo_unitario"] = float(costo_unitario)
    res = api_request("PATCH", f"/productos/ingredientes/{ingrediente_id}", json=payload)
    if res and res.status_code == 200:
        flash("Ingrediente actualizado correctamente", "success")
    else:
        error_msg = "Error al actualizar el ingrediente."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('inventario'))

@app.route("/inventario/ajustar-stock/<int:ingrediente_id>", methods=["POST"])
@login_required
def ajustar_stock(ingrediente_id):
    cantidad = request.form.get("cantidad")
    tipo = request.form.get("tipo", "sumar")
    if not cantidad:
        flash("Cantidad no especificada", "warning")
        return redirect(url_for('inventario'))
    try:
        cantidad = float(cantidad)
    except ValueError:
        flash("Cantidad inválida", "danger")
        return redirect(url_for('inventario'))
    if tipo == "restar":
        cantidad = -cantidad
    res = api_request("PATCH", f"/productos/ingredientes/{ingrediente_id}/ajustar-stock?cantidad={cantidad}")
    if res and res.status_code == 200:
        flash(f"Stock actualizado correctamente. Nuevo stock: {res.json().get('stock_actual')}", "success")
    else:
        error_msg = "Error al ajustar el stock."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('inventario'))

@app.route("/inventario/eliminar/<int:ingrediente_id>", methods=["POST"])
@login_required
def eliminar_ingrediente(ingrediente_id):
    res = api_request("DELETE", f"/productos/ingredientes/{ingrediente_id}")
    if res and res.status_code == 204:
        flash("Ingrediente eliminado correctamente", "success")
    else:
        error_msg = "No se pudo eliminar el ingrediente. Puede estar siendo usado por un producto."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('inventario'))

@app.route("/compras/registrar", methods=["POST"])
@login_required
def registrar_compra():
    id_ingrediente = request.form.get("id_ingrediente")
    cantidad = request.form.get("cantidad")
    costo_total = request.form.get("costo_total")
    fecha = request.form.get("fecha")
    if not all([id_ingrediente, cantidad, costo_total]):
        flash("Todos los campos son obligatorios", "warning")
        return redirect(url_for('inventario'))
    payload = {
        "id_ingrediente": int(id_ingrediente),
        "cantidad": float(cantidad),
        "costo_total": float(costo_total),
        "fecha": fecha or datetime.now().strftime("%Y-%m-%d")
    }
    res = api_request("POST", "/compras", json=payload)
    if res and res.status_code == 201:
        flash("Compra registrada correctamente", "success")
    else:
        error_msg = "Error al registrar la compra."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('inventario'))

@app.route("/ingredientes/crear", methods=["POST"])
@login_required
def crear_ingrediente():
    nombre = request.form.get("nombre")
    unidad = request.form.get("unidad")
    stock_actual = request.form.get("stock_actual")
    stock_minimo = request.form.get("stock_minimo")
    costo_unitario = request.form.get("costo_unitario")
    if not nombre or not unidad:
        flash("Nombre y unidad son obligatorios", "warning")
        return redirect(url_for('inventario'))
    payload = {
        "nombre": nombre,
        "unidad": unidad,
        "stock_actual": float(stock_actual) if stock_actual else 0,
        "stock_minimo": float(stock_minimo) if stock_minimo else 0,
        "costo_unitario": float(costo_unitario) if costo_unitario else 0,
    }
    res = api_request("POST", "/productos/ingredientes", json=payload)
    if res and res.status_code == 201:
        flash("Ingrediente creado correctamente", "success")
    else:
        error_msg = "Error al crear el ingrediente."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('inventario'))

@app.route("/mesas")
@login_required
def mesas():
    res = api_request("GET", "/mesas")
    mesas = res.json() if res and res.status_code == 200 else []
    return render_template(
        "mesas.html",
        mesas=mesas,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )

@app.route("/mesas/crear", methods=["POST"])
@login_required
def crear_mesa():
    numero = request.form.get("numero")
    capacidad = request.form.get("capacidad")
    if not numero or not capacidad:
        flash("Todos los campos son obligatorios", "warning")
        return redirect(url_for('mesas'))
    payload = {
        "numero": int(numero),
        "capacidad": int(capacidad)
    }
    res = api_request("POST", "/mesas", json=payload)
    if res and res.status_code == 201:
        flash("Mesa creada correctamente", "success")
    else:
        error_msg = "Error al crear la mesa."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

@app.route("/mesas/eliminar/<int:mesa_id>", methods=["POST"])
@login_required
def eliminar_mesa(mesa_id):
    res = api_request("DELETE", f"/mesas/{mesa_id}")
    if res and res.status_code == 204:
        flash("Mesa eliminada correctamente", "success")
    else:
        error_msg = "No se pudo eliminar la mesa."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

@app.route("/mesas/ocupar/<int:mesa_id>", methods=["POST"])
@login_required
def ocupar_mesa(mesa_id):
    res = api_request("PATCH", f"/mesas/{mesa_id}/ocupar")
    if res and res.status_code == 200:
        data = res.json()
        flash(f"Mesa ocupada correctamente. Pedido #{data.get('pedido_id')}", "success")
    else:
        error_msg = "Error al ocupar la mesa."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

@app.route("/mesas/liberar/<int:mesa_id>", methods=["POST"])
@login_required
def liberar_mesa(mesa_id):
    res = api_request("PATCH", f"/mesas/{mesa_id}/liberar")
    if res and res.status_code == 200:
        data = res.json()
        flash(f"Mesa liberada correctamente. Pedido #{data.get('pedido_id')} cerrado.", "success")
    else:
        error_msg = "Error al liberar la mesa."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

@app.route("/mesas/reservar/<int:mesa_id>", methods=["POST"])
@login_required
def reservar_mesa(mesa_id):
    res = api_request("PATCH", f"/mesas/{mesa_id}/reservar")
    if res and res.status_code == 200:
        data = res.json()
        flash(f"Mesa reservada correctamente. Reserva #{data.get('pedido_id')}", "success")
    else:
        error_msg = "Error al reservar la mesa."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

@app.route("/mesas/cancelar-reserva/<int:mesa_id>", methods=["POST"])
@login_required
def cancelar_reserva(mesa_id):
    res = api_request("PATCH", f"/mesas/{mesa_id}/cancelar-reserva")
    if res and res.status_code == 200:
        flash("Reserva cancelada correctamente", "success")
    else:
        error_msg = "Error al cancelar la reserva."
        if res and res.status_code == 400:
            error_msg = res.json().get("detail", error_msg)
        flash(error_msg, "danger")
    return redirect(url_for('mesas'))

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")