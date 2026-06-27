DROP TABLE IF EXISTS detalle_observaciones      CASCADE;
DROP TABLE IF EXISTS historial_estados_pedido   CASCADE;
DROP TABLE IF EXISTS compras_suministros        CASCADE;
DROP TABLE IF EXISTS gastos                     CASCADE;
DROP TABLE IF EXISTS ventas                     CASCADE;
DROP TABLE IF EXISTS detalle_pedido             CASCADE;
DROP TABLE IF EXISTS pedidos                    CASCADE;
DROP TABLE IF EXISTS producto_ingrediente       CASCADE;
DROP TABLE IF EXISTS ingredientes               CASCADE;
DROP TABLE IF EXISTS productos                  CASCADE;
DROP TABLE IF EXISTS mesas                      CASCADE;
DROP TABLE IF EXISTS usuarios                   CASCADE;
DROP TABLE IF EXISTS estados_pedido             CASCADE;
DROP TABLE IF EXISTS roles                      CASCADE;
DROP TABLE IF EXISTS categorias                 CASCADE;
DROP TABLE IF EXISTS metodos_pago               CASCADE;


CREATE TABLE roles (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE categorias (
    id     SERIAL       PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo   VARCHAR(20)  NOT NULL CHECK (tipo IN ('producto','gasto','ambos'))
);

CREATE TABLE metodos_pago (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE estados_pedido (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(30)  NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    id_rol      INT          NOT NULL REFERENCES roles(id)
    -- Define qué rol tiene permiso de aplicar este estado:
    -- pendiente     → mesero
    -- en_preparacion → cocina
    -- listo         → cocina
    -- entregado     → mesero
    -- pagado        → caja
    -- cancelado     → caja
);

CREATE TABLE usuarios (
    id            SERIAL       PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol        INT          NOT NULL REFERENCES roles(id),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE mesas (
    id        SERIAL PRIMARY KEY,
    numero    INT    NOT NULL UNIQUE,
    capacidad INT    NOT NULL CHECK (capacidad > 0)
);

CREATE TABLE productos (
    id           SERIAL        PRIMARY KEY,
    nombre       VARCHAR(150)  NOT NULL,
    descripcion  TEXT,
    precio       NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    id_categoria INT           REFERENCES categorias(id),
    disponible   BOOLEAN       NOT NULL DEFAULT TRUE,
    imagen_url   VARCHAR(255),
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE ingredientes (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(100)  NOT NULL,
    unidad         VARCHAR(30)   NOT NULL,
    stock_actual   NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo   NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (costo_unitario >= 0)
);

CREATE TABLE producto_ingrediente (
    id_producto    INT           NOT NULL REFERENCES productos(id)    ON DELETE CASCADE,
    id_ingrediente INT           NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    cantidad       NUMERIC(10,3) NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (id_producto, id_ingrediente)
);

CREATE TABLE pedidos (
    id               SERIAL    PRIMARY KEY,
    id_mesa          INT       NOT NULL REFERENCES mesas(id),
    id_mesero        INT       NOT NULL REFERENCES usuarios(id),
    id_estado_actual INT       NOT NULL REFERENCES estados_pedido(id),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE detalle_pedido (
    id              SERIAL        PRIMARY KEY,
    id_pedido       INT           NOT NULL REFERENCES pedidos(id)  ON DELETE CASCADE,
    id_producto     INT           NOT NULL REFERENCES productos(id),
    cantidad        INT           NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(10,2) GENERATED ALWAYS AS (precio_unitario * cantidad) STORED
);

CREATE TABLE detalle_observaciones (
    id          SERIAL       PRIMARY KEY,
    id_detalle  INT          NOT NULL REFERENCES detalle_pedido(id) ON DELETE CASCADE,
    observacion VARCHAR(255) NOT NULL
);

CREATE TABLE historial_estados_pedido (
    id                SERIAL    PRIMARY KEY,
    id_pedido         INT       NOT NULL REFERENCES pedidos(id)       ON DELETE CASCADE,
    id_estado_origen  INT       REFERENCES estados_pedido(id),        
    id_estado_destino INT       NOT NULL REFERENCES estados_pedido(id),
    id_usuario        INT       NOT NULL REFERENCES usuarios(id),    
    cambiado_en       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas (
    id             SERIAL        PRIMARY KEY,
    id_pedido      INT           NOT NULL UNIQUE REFERENCES pedidos(id),
    id_cajero      INT           NOT NULL REFERENCES usuarios(id),
    id_metodo_pago INT           NOT NULL REFERENCES metodos_pago(id),
    monto_total    NUMERIC(10,2) NOT NULL CHECK (monto_total >= 0),
    monto_recibido NUMERIC(10,2),
    fecha          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos (
    id           SERIAL        PRIMARY KEY,
    descripcion  VARCHAR(255)  NOT NULL,
    monto        NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    id_categoria INT           REFERENCES categorias(id),
    id_usuario   INT           NOT NULL REFERENCES usuarios(id),
    fecha        DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE compras_suministros (
    id             SERIAL        PRIMARY KEY,
    id_ingrediente INT           NOT NULL REFERENCES ingredientes(id),
    id_usuario     INT           NOT NULL REFERENCES usuarios(id),
    cantidad       NUMERIC(10,3) NOT NULL CHECK (cantidad > 0),
    costo_total    NUMERIC(10,2) NOT NULL CHECK (costo_total >= 0),
    fecha          DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_estado       ON pedidos(id_estado_actual);
CREATE INDEX idx_pedidos_mesa         ON pedidos(id_mesa);
CREATE INDEX idx_pedidos_mesero       ON pedidos(id_mesero);
CREATE INDEX idx_pedidos_created      ON pedidos(created_at);
CREATE INDEX idx_detalle_pedido       ON detalle_pedido(id_pedido);
CREATE INDEX idx_det_obs_detalle      ON detalle_observaciones(id_detalle);
CREATE INDEX idx_historial_pedido     ON historial_estados_pedido(id_pedido);
CREATE INDEX idx_historial_usuario    ON historial_estados_pedido(id_usuario);
CREATE INDEX idx_historial_fecha      ON historial_estados_pedido(cambiado_en);
CREATE INDEX idx_ventas_cajero        ON ventas(id_cajero);
CREATE INDEX idx_ventas_fecha         ON ventas(fecha);
CREATE INDEX idx_ventas_metodo        ON ventas(id_metodo_pago);
CREATE INDEX idx_gastos_fecha         ON gastos(fecha);
CREATE INDEX idx_gastos_usuario       ON gastos(id_usuario);
CREATE INDEX idx_compras_ingrediente  ON compras_suministros(id_ingrediente);
CREATE INDEX idx_compras_fecha        ON compras_suministros(fecha);
CREATE INDEX idx_usuarios_rol         ON usuarios(id_rol);
CREATE INDEX idx_productos_cat        ON productos(id_categoria);

