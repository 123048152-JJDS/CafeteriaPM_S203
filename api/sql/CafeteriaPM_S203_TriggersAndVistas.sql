-- ══════════════════════════════════════════════════════════════════════
--  TRIGGERS
-- ══════════════════════════════════════════════════════════════════════

-- Trigger 1: auto-actualizar updated_at en pedidos
CREATE OR REPLACE FUNCTION fn_pedido_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedidos_updated_at
BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_pedido_timestamp();

-- Trigger 2: descontar ingredientes cuando cocina marca 'listo'
CREATE OR REPLACE FUNCTION fn_descontar_ingredientes()
RETURNS TRIGGER AS $$
DECLARE
    v_nombre_nuevo VARCHAR(30);
    v_nombre_viejo VARCHAR(30);
BEGIN
    SELECT nombre INTO v_nombre_nuevo FROM estados_pedido WHERE id = NEW.id_estado_actual;
    SELECT nombre INTO v_nombre_viejo FROM estados_pedido WHERE id = OLD.id_estado_actual;
    IF v_nombre_nuevo = 'listo' AND v_nombre_viejo <> 'listo' THEN
        UPDATE ingredientes i
        SET    stock_actual = i.stock_actual - (dp.cantidad * pi.cantidad)
        FROM   detalle_pedido dp
        JOIN   producto_ingrediente pi ON pi.id_producto = dp.id_producto
        WHERE  dp.id_pedido = NEW.id AND i.id = pi.id_ingrediente;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descontar_ingredientes
AFTER UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_descontar_ingredientes();

-- Trigger 3: actualizar stock al registrar compra
CREATE OR REPLACE FUNCTION fn_sumar_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ingredientes SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.id_ingrediente;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_stock
AFTER INSERT ON compras_suministros
FOR EACH ROW EXECUTE FUNCTION fn_sumar_stock();

-- ══════════════════════════════════════════════════════════════════════
--  VISTAS
-- ══════════════════════════════════════════════════════════════════════

-- Estado de mesas (Fix 1FN: mesas.estado eliminado, se calcula aquí)
CREATE OR REPLACE VIEW vw_estado_mesas AS
SELECT
    m.id, m.numero, m.capacidad,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pedidos p
            JOIN estados_pedido ep ON ep.id = p.id_estado_actual
            WHERE p.id_mesa = m.id
              AND ep.nombre NOT IN ('pagado','cancelado')
        ) THEN 'ocupada'
        ELSE 'disponible'
    END AS estado
FROM mesas m
ORDER BY m.numero;

-- Pedidos activos con total calculado (Fix 3FN: pedidos.total eliminado)
CREATE OR REPLACE VIEW vw_pedidos_activos AS
SELECT
    p.id,
    ep.nombre                              AS estado,
    COALESCE(SUM(dp.subtotal), 0)          AS total,
    p.created_at, p.updated_at,
    m.numero                               AS mesa,
    u.nombre                               AS mesero
FROM   pedidos        p
JOIN   estados_pedido ep ON ep.id = p.id_estado_actual
JOIN   mesas          m  ON m.id  = p.id_mesa
JOIN   usuarios       u  ON u.id  = p.id_mesero
LEFT   JOIN detalle_pedido dp ON dp.id_pedido = p.id
WHERE  ep.nombre NOT IN ('pagado','cancelado')
GROUP  BY p.id, ep.nombre, p.created_at, p.updated_at, m.numero, u.nombre
ORDER  BY p.created_at ASC;

-- Historial legible de cambios de estado (quién cambió qué y cuándo)
CREATE OR REPLACE VIEW vw_historial_pedidos AS
SELECT
    h.id_pedido,
    ep_o.nombre   AS estado_origen,
    ep_d.nombre   AS estado_destino,
    u.nombre      AS cambiado_por,
    r.nombre      AS rol,
    h.cambiado_en
FROM   historial_estados_pedido h
JOIN   estados_pedido ep_d ON ep_d.id = h.id_estado_destino
LEFT   JOIN estados_pedido ep_o ON ep_o.id = h.id_estado_origen
JOIN   usuarios u ON u.id = h.id_usuario
JOIN   roles    r ON r.id = u.id_rol
ORDER  BY h.id_pedido, h.cambiado_en;

-- Ventas con cambio calculado (Fix 3FN: ventas.cambio eliminado)
CREATE OR REPLACE VIEW vw_ventas_hoy AS
SELECT
    v.id, v.monto_total, v.monto_recibido,
    (v.monto_recibido - v.monto_total) AS cambio,
    mp.nombre  AS metodo_pago,
    v.fecha,
    m.numero   AS mesa,
    u.nombre   AS cajero
FROM   ventas       v
JOIN   pedidos      p  ON p.id  = v.id_pedido
JOIN   mesas        m  ON m.id  = p.id_mesa
JOIN   usuarios     u  ON u.id  = v.id_cajero
JOIN   metodos_pago mp ON mp.id = v.id_metodo_pago
WHERE  v.fecha::date = CURRENT_DATE
ORDER  BY v.fecha DESC;

-- Stock bajo
CREATE OR REPLACE VIEW vw_stock_bajo AS
SELECT id, nombre, unidad, stock_actual, stock_minimo,
       ROUND((stock_actual / NULLIF(stock_minimo,0)) * 100, 1) AS pct_stock
FROM   ingredientes WHERE stock_actual <= stock_minimo
ORDER  BY pct_stock ASC;

-- Balance del día
CREATE OR REPLACE VIEW vw_balance_dia AS
SELECT
    CURRENT_DATE AS fecha,
    COALESCE((SELECT SUM(monto_total) FROM ventas WHERE fecha::date = CURRENT_DATE), 0) AS total_ventas,
    COALESCE((SELECT SUM(monto)       FROM gastos WHERE fecha        = CURRENT_DATE), 0) AS total_gastos,
    COALESCE((SELECT SUM(monto_total) FROM ventas WHERE fecha::date = CURRENT_DATE), 0)
   -COALESCE((SELECT SUM(monto)       FROM gastos WHERE fecha        = CURRENT_DATE), 0) AS ganancia_neta,
    (SELECT COUNT(*) FROM ventas WHERE fecha::date = CURRENT_DATE)                        AS num_ventas,
    (SELECT COUNT(*) FROM pedidos
     JOIN estados_pedido ep ON ep.id = pedidos.id_estado_actual
     WHERE ep.nombre NOT IN ('pagado','cancelado')
       AND pedidos.created_at::date = CURRENT_DATE)                                       AS pedidos_activos;
