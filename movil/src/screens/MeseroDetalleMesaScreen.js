import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import TablaDetalle from '../components/TablaDetalle'
import BotonPrimario from '../components/BotonPrimario'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'producto', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
]

export default function MeseroDetalleMesaScreen({ onEditarPedido, onOcuparMesa, onLiberar, onCancelado }) {
  const { mesaId, estado, pedidoId } = useLocalSearchParams()
  const { auth } = useAuth()
  const esReserva = estado === 'reservada'

  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const handleLiberarMesa = () => {
    if (onLiberar) {
      onLiberar()
    } else if (onCancelado) {
      onCancelado()
    }
  }

  const cargarPedido = useCallback(async () => {
    if (!pedidoId) { setCargando(false); return }
    try {
      setError(null)
      const data = await api.get(`/pedidos/${pedidoId}`, auth?.token)
      setPedido(data)
    } catch (e) {
      setError(e.message || 'No se pudo cargar el pedido')
    } finally {
      setCargando(false)
    }
  }, [pedidoId, auth?.token])

  useFocusEffect(useCallback(() => { cargarPedido() }, [cargarPedido]))

  const nombreEstado = pedido?.estado_actual?.nombre
  const puedeCancelar = nombreEstado === 'pendiente'
  const puedeEditar = nombreEstado === 'pendiente' || nombreEstado === 'en_preparacion'

  const confirmarCancelarPedido = () => {
    Alert.alert(
      'Cancelar pedido',
      '¿Seguro que quieres cancelar este pedido? La mesa quedará disponible de nuevo.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setProcesando(true)
            try {
              await api.patch(`/mesas/${mesaId}/cancelar-pedido`, {}, auth?.token)
              handleLiberarMesa()
            } catch (e) {
              Alert.alert('No se pudo cancelar el pedido', e.message)
            } finally {
              setProcesando(false)
            }
          },
        },
      ]
    )
  }

  const confirmarCancelarReserva = () => {
    Alert.alert(
      'Cancelar reserva',
      '¿Seguro que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setProcesando(true)
            try {
              await api.patch(`/mesas/${mesaId}/cancelar-reserva`, {}, auth?.token)
              handleLiberarMesa()
            } catch (e) {
              Alert.alert('No se pudo cancelar la reserva', e.message)
            } finally {
              setProcesando(false)
            }
          },
        },
      ]
    )
  }

  const handleOcupar = async () => {
    setProcesando(true)
    try {
      const res = await api.patch(`/mesas/${mesaId}/ocupar`, {}, auth?.token)
      onOcuparMesa?.(mesaId, res.pedido_id)
    } catch (e) {
      Alert.alert('No se pudo ocupar la mesa', e.message)
    } finally {
      setProcesando(false)
    }
  }

  const items = (pedido?.detalles || []).map(d => ({
    cantidad: d.cantidad,
    producto: d.producto?.nombre || `Producto #${d.id_producto}`,
    precio: `$${Number(d.precio_unitario).toFixed(2)}`,
  }))

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mesa {mesaId ?? '--'}</Text>
        <Text style={styles.estado}>{esReserva ? 'Reservada' : 'Ocupada'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {cargando ? (
          <ActivityIndicator color="#1F3864" style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : esReserva ? (
          <View style={styles.alerta}>
            <Text style={styles.alertaTexto}>📅 Mesa reservada, aún sin pedido</Text>
          </View>
        ) : (
          <>
            <View style={styles.alerta}>
              <Text style={styles.alertaTexto}>
                ⚠️ Pedido #{pedido?.id} · {nombreEstado || '—'}
              </Text>
            </View>
            <TablaDetalle columnas={COLUMNAS} datos={items} />
            <Text style={styles.total}>Total: ${Number(pedido?.total || 0).toFixed(2)}</Text>
          </>
        )}

        <View style={styles.botones}>
          {esReserva ? (
            <>
              <BotonPrimario titulo="Ocupar mesa" onPress={handleOcupar} disabled={procesando} />
              <BotonPrimario titulo="Cancelar reserva" color="#ef5350" onPress={confirmarCancelarReserva} disabled={procesando} />
            </>
          ) : (
            <>
              {puedeEditar && (
                <BotonPrimario
                  titulo="Editar pedido"
                  onPress={() => onEditarPedido?.(mesaId, pedidoId)}
                  disabled={procesando || !pedido}
                />
              )}
              {puedeCancelar && (
                <BotonPrimario titulo="Cancelar pedido" color="#ef5350" onPress={confirmarCancelarPedido} disabled={procesando} />
              )}
              {!puedeCancelar && !esReserva && (
                <Text style={styles.avisoNoCancelable}>
                  Este pedido ya está en preparación o listo; no se puede cancelar desde aquí.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864' },
  estado: { fontSize: 13, color: '#ef5350' },
  content: { padding: 16, gap: 16 },
  error: { color: '#c62828', textAlign: 'center' },
  alerta: { backgroundColor: '#fff8e1', borderRadius: 8, padding: 10, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  alertaTexto: { color: '#f57f17', fontWeight: 'bold' },
  total: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', textAlign: 'right' },
  botones: { gap: 8 },
  avisoNoCancelable: { fontSize: 12, color: '#888888', textAlign: 'center', fontStyle: 'italic' },
})