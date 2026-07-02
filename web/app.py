import os
import requests
from flask import Flask, render_template, request, redirect, url_for, session, flash, Response
from functools import wraps

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'templates'))
app.secret_key = os.urandom(24)  # En producción, usa una variable de entorno

# Configuración de la API
API_BASE_URL = "http://localhost:8000"


# ── Decorador para rutas protegidas ───────────────────────────
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'access_token' not in session:
            flash("Por favor, inicia sesión primero.", "warning")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


# ── Helper para llamar a la API con autenticación ─────────────
def api_request(method, endpoint, data=None, files=None, json=None):
    """Hace una petición a la API incluyendo el token de sesión."""
    headers = {"Authorization": f"Bearer {session.get('access_token')}"}
    url = f"{API_BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json or data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json or data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError("Método HTTP no soportado")
        return response
    except requests.exceptions.ConnectionError:
        flash("Error: No se pudo conectar con la API. ¿Está corriendo?", "danger")
        return None


# ════════════════════════════════════════════════════════════════
#  RUTAS DE AUTENTICACIÓN
# ════════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def index():
    # Si ya está logueado, va al dashboard; si no, al login.
    if 'access_token' in session:
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


# ════════════════════════════════════════════════════════════════
#  RUTAS PRINCIPALES (protegidas)
# ════════════════════════════════════════════════════════════════

@app.route("/dashboard")
@login_required
def dashboard():
    # Obtener datos del dashboard desde /stats/dashboard
    res = api_request("GET", "/stats/dashboard")
    stats = {}
    productos = []
    if res and res.status_code == 200:
        stats = res.json()
        productos = stats.get("productos_mas_vendidos", [])
    else:
        flash("No se pudieron cargar las estadísticas", "warning")

    return render_template(
        "dashboard.html",
        stats=stats,
        productos=productos,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )


@app.route("/usuarios", methods=["GET", "POST"])
@login_required
def usuarios():
    # Solo administradores pueden ver/editar usuarios (lo validamos con la API)
    if session.get('user_role') != 'admin':
        flash("No tienes permisos para ver esta sección", "danger")
        return redirect(url_for('dashboard'))

    # Obtener lista de usuarios y roles
    res_users = api_request("GET", "/usuarios/")
    res_roles = api_request("GET", "/usuarios/roles")
    
    users = res_users.json() if res_users and res_users.status_code == 200 else []
    roles = res_roles.json() if res_roles and res_roles.status_code == 200 else []

    # Si se envía el formulario para crear usuario (POST)
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
                flash("Error al crear usuario. Verifica el email o los datos.", "danger")

    return render_template(
        "usuarios.html",
        users=users,
        roles=roles,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )


@app.route("/usuarios/eliminar/<int:user_id>", methods=["POST"])
@login_required
def eliminar_usuario(user_id):
    if session.get('user_role') != 'admin':
        flash("No tienes permisos", "danger")
        return redirect(url_for('dashboard'))
    
    res = api_request("DELETE", f"/usuarios/{user_id}")
    if res and res.status_code == 204:
        flash("Usuario eliminado correctamente", "success")
    else:
        flash("No se pudo eliminar el usuario", "danger")
    return redirect(url_for('usuarios'))


@app.route("/estadisticas")
@login_required
def estadisticas():
    # Obtener top productos y stock bajo
    res_top = api_request("GET", "/stats/productos-mas-vendidos?limit=10")
    res_ingredientes = api_request("GET", "/productos/ingredientes/stock-bajo")
    
    top_productos = res_top.json() if res_top and res_top.status_code == 200 else []
    stock_bajo = res_ingredientes.json() if res_ingredientes and res_ingredientes.status_code == 200 else []

    # Links directos para descargar PDF y XLSX (usando el token de sesión en headers)
    pdf_url = f"{API_BASE_URL}/stats/reporte-ventas/pdf"
    xlsx_url = f"{API_BASE_URL}/stats/reporte-ventas/xlsx"

    return render_template(
        "estadisticas.html",
        top_productos=top_productos,
        stock_bajo=stock_bajo,
        pdf_url=pdf_url,
        xlsx_url=xlsx_url,
        user_name=session.get('user_name'),
        user_role=session.get('user_role')
    )


@app.route("/proxy/pdf")
@login_required
def proxy_pdf():
    """Redirige/descarga el PDF generado por la API."""
    res = api_request("GET", "/stats/reporte-ventas/pdf")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=reporte_ventas.pdf"
        })
    flash("Error al generar el PDF", "danger")
    return redirect(url_for('estadisticas'))


@app.route("/proxy/xlsx")
@login_required
def proxy_xlsx():
    """Redirige/descarga el Excel generado por la API."""
    res = api_request("GET", "/stats/reporte-ventas/xlsx")
    if res and res.status_code == 200:
        return Response(res.content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=reporte_ventas.xlsx"
        })
    flash("Error al generar el Excel", "danger")
    return redirect(url_for('estadisticas'))


# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")