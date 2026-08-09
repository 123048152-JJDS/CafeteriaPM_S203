# Informe de Auditoría del Proyecto: CafeteriaPM

**Fecha de Auditoría:** 6 de Agosto, 2026  
**Proyecto:** Sistema Integral de Administración de Cafetería (CafeteriaPM)  
**Repositorio:** CafeteriaPM_S203  

---

## Resumen Ejecutivo

El presente documento constituye el informe de auditoría técnica y funcional para el proyecto **CafeteriaPM**. La evaluación se ha estructurado en 5 ejes fundamentales:

1. **Aplicación Móvil** (React Native + Expo Router)
2. **Aplicación Web** (Flask + Jinja2 + Bootstrap 5 + Chart.js)
3. **API REST Centralizada** (FastAPI + Pydantic + JWT)
4. **Base de Datos Relacional Integrada** (PostgreSQL + SQLAlchemy)
5. **Tarjeta de Credenciales y Perfiles de Acceso**

---

## 1. Aplicación Móvil Completa y Funcional

* **Tecnología & Arquitectura**: Desarrollada en **React Native** con **Expo Router** y navegación estructurada por módulos de usuario. Utiliza la API Fetch native integrada con la API REST (`src/services/api.js`) enviando tokens JWT en el encabezado `Authorization`.
* **Estructura por Roles y Pantallas Implementadas**:
  * 🧑‍🍳 **Módulo Mesero**:
    * **Mesas**: Vista general del mapa de mesas y su disponibilidad (`MeseroMesasScreen.js`).
    * **Detalle de Mesa**: Consumo activo por mesa (`MeseroDetalleMesaScreen.js`).
    * **Catálogo & Pedido**: Selección de productos con notas u observaciones personalizadas (`MeseroPedidoCatalogoScreen.js`).
    * **Resumen de Pedido**: Verificación antes del envío a cocina (`MeseroPedidoResumenScreen.js`).
    * **Estado del Pedido**: Monitoreo en tiempo real del progreso de la comanda (`MeseroPedidoEstadoScreen.js`, `MeseroPedidosScreen.js`).
  * 👨‍🍳 **Módulo Cocina**:
    * **Cola de Pedidos**: Pantalla principal con ordenes en espera (`CocinaPedidosScreen.js`).
    * **Gestión de Estados**: Cambio fluido de estado (*Pendiente* $\rightarrow$ *En preparación* $\rightarrow$ *Listo*) (`CocinaDetallePedidoScreen.js`).
    * **Gestión de Productos**: Administración del catálogo de cocina (`CocinaMenuScreen.js`, `CocinaNuevoProductoScreen.js`, `CocinaEditarProductoScreen.js`).
    * **Control de Inventario**: Monitoreo de stock de ingredientes (`CocinaInventarioScreen.js`).
    * **Registro de Compras**: Entrada de materia prima/suministros (`CocinaRegistrarCompraScreen.js`).
  * 💳 **Módulo Caja**:
    * **Pedidos Pendientes de Pago**: Filtro de comandas listas para cobro (`CajaPedidosActivosScreen.js`).
    * **Procesamiento de Pago**: Admisión de efectivo/tarjeta y cálculo de cambio (`CajaPagosScreen.js`, `CajaConfirmarPedidoScreen.js`).
    * **Emisión de Ticket**: Generación y formateo de comprobante (`CajaTicketScreen.js`).
    * **Registro de Gastos**: Salidas de dinero operacionales (`CajaGastosScreen.js`).
    * **Balance Diario**: Resumen de caja y cierre (`CajaBalanceScreen.js`).

---

## 2. Aplicación Web Completa y Funcional

* **Tecnología & Arquitectura**: Implementada en **Python (Flask)** con renderizado mediante plantillas **Jinja2**, diseño responsive con **Bootstrap 5** y analítica interactiva mediante **Chart.js**.
* **Módulos del Panel de Administración (`admin`)**:
  * 📊 **Dashboard Principal** (`templates/dashboard.html`): Tarjetas con métricas clave (ventas del día, pedidos completados, productos activos y alertas de inventario crítico).
  * 👥 **Gestión de Usuarios** (`templates/usuarios.html`): CRUD completo de personal, asignación de roles (`admin`, `cocina`, `caja`, `mesero`) y activación/desactivación.
  * ☕ **Catálogo de Menú** (`templates/menu.html`): Alta, baja y modificación de productos, precios, fotos y categorías.
  * 🪑 **Gestión de Mesas** (`templates/mesas.html`): Configuración de número de mesa y capacidad de comensales.
  * 📦 **Inventario e Ingredientes** (`templates/inventario.html`): Administración de insumos, control de stock mínimo y registro de compras.
  * 📋 **Monitor de Pedidos** (`templates/pedidos.html`): Visualización en tiempo real de todos los pedidos levantados desde la app móvil.
  * 📈 **Reportes y Estadísticas** (`templates/estadisticas.html`): Gráficos de barra y dona para análisis de Ingresos vs. Gastos, Top Productos Vendidos y Desglose por Método de Pago.

---

## 3. API REST Centralizada y Funcional

* **Tecnología**: Desarrollada con **FastAPI (Python 3.10+)**, validación Pydantic y ORM SQLAlchemy.
* **Documentación Interactiva**:
  * **Swagger UI**: Disponible en `http://localhost:8000/docs`
  * **ReDoc**: Disponible en `http://localhost:8000/redoc`
* **Módulos de Endpoints**:
  * `/auth/login`: Autenticación OAuth2 y generación de tokens JWT.
  * `/usuarios`: Endpoints para administración de cuentas de usuario.
  * `/productos`, `/mesas`: Endpoints para catálogo y disposición de salón.
  * `/pedidos`: Creación de comandas, actualización de estado e historial de cambios (`HistorialEstadoPedido`).
  * `/ventas`: Liquidación de cuentas, cálculo de cambio y registro de ventas.
  * `/gastos` & `/compras`: Endpoints para egresos y compras de suministros.
  * `/stats`: Endpoints con consultas agregadas para gráficos y métricas financieras.
  * `/ws`: Endpoint para comunicación bidireccional mediante WebSockets.

---

## 4. Base de Datos Integral y Relacional

* **Motor**: **PostgreSQL** (con soporte SQLAlchemy ORM).
* **Estructura Relacional Integrada (13 Tablas Principales)**:
  1. `roles`: Definición de perfiles (`admin`, `cocina`, `caja`, `mesero`).
  2. `usuarios`: Credenciales de acceso con contraseñas encriptadas mediante Bcrypt.
  3. `categorias`: Clasificación de ítems de menú y conceptos de gasto.
  4. `metodos_pago`: Medios de cobro permitidos (Efectivo, Tarjeta, Transferencia).
  5. `estados_pedido`: Flujo de vida del pedido (*pendiente*, *en_preparacion*, *listo*, *pagado*, *cancelado*).
  6. `mesas`: Catálogo de mesas físicas del establecimiento.
  7. `productos`: Platillos y bebidas ofrecidos.
  8. `ingredientes`: Control de stock e insumos de cocina.
  9. `producto_ingrediente`: Relación N:M para recetas y descuento de insumos.
  10. `pedidos`: Cabecera de la orden asignada a mesa y mesero.
  11. `detalle_pedido`: Ítems individuales con precio unitario y subtotal.
  12. `detalle_observaciones`: Notas especiales del cliente por platillo.
  13. `historial_estados_pedido`: Trazabilidad completa con fechas y usuario responsable.
  14. `ventas`, `gastos`, `compras_suministros`: Tablas de registro financiero y de inventario.
* **Scripts de Carga Inicial (Seeds)**:
  * `seed_admin.py`: Crea roles base y usuario administrador primario.
  * `seed_estados.py`: Inicializa la máquina de estados de pedidos.
  * `seed_productos.py`: Puebla el menú por defecto con categorías.
  * `seed_demo_data.py`: Genera transacciones y usuarios de prueba.
  * `seed_all.py`: Script maestro de ejecución secuencial.

---

## 5. Tarjeta de Credenciales de Usuario

| ROL | USUARIO / CORREO | CONTRASEÑA | APLICACIÓN | MÓDULOS PERMITIDOS |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Administrador** | `admin@cafe.com` | `Admin123!` | Web & Móvil | Panel Web completo, Estadísticas, Usuarios |
| 🧑‍🍳 **Mesero 1** | `ana@cafe.com` | `mesero123` | Móvil | Ver Mesas, Tomar Pedidos, Estado de Pedidos |
| 🧑‍🍳 **Mesero 2** | `luis@cafe.com` | `mesero123` | Móvil | Ver Mesas, Tomar Pedidos, Estado de Pedidos |
| 🧑‍🍳 **Mesero 3** | `marta@cafe.com` | `mesero123` | Móvil | Ver Mesas, Tomar Pedidos, Estado de Pedidos |
| 👨‍🍳 **Cocinero 1** | `carlos@cafe.com` | `cocina123` | Móvil | Cola de Pedidos, Menú, Inventario, Compras |
| 👨‍🍳 **Cocinero 2** | `elena@cafe.com` | `cocina123` | Móvil | Cola de Pedidos, Menú, Inventario, Compras |
| 💳 **Cajero 1** | `juan@cafe.com` | `caja123` | Móvil | Cobro de Pedidos, Ticket, Gastos, Balance |
| 💳 **Cajero 2** | `laura@cafe.com` | `caja123` | Móvil | Cobro de Pedidos, Ticket, Gastos, Balance |

---

## Guía de Despliegue Local

1. **Backend (API REST)**:
   ```bash
   cd api
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
2. **Servidor Web (Panel Admin)**:
   ```bash
   cd web
   python app.py
   # Acceso en: http://localhost:5000
   ```
3. **Aplicación Móvil (Expo React Native)**:
   ```bash
   cd movil
   npx expo start --clear
   ```
