import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import TablaDetalle from '../components/TablaDetalle'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'producto', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
]

const PASOS = ['pendiente', 'en_preparacion', 'listo', 'entregado']

export default function MeseroPedidoEstadoScreen() {
  const { pedidoId } = useLocalSearchParams()
  const { auth } = useAuth()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
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

  useFocusEffect(useCallback(() => { cargar() }, [cargar]))

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Estado pedido</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  if (error || !pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Estado pedido</Text>
        <Text style={styles.error}>{error || 'Pedido no encontrado'}</Text>
      </SafeAreaView>
    )
  }

  const estadoActual = pedido.estado_actual?.nombre
  const pasoActivo = PASOS.indexOf(estadoActual)
  const items = (pedido.detalles || []).map(d => ({
    cantidad: d.cantidad,
    producto: d.producto?.nombre || `Producto #${d.id_producto}`,
    precio: `$${Number(d.precio_unitario).toFixed(2)}`,
  }))

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Estado pedido #{pedido.id}</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTexto}>Mesa {pedido.mesa?.numero ?? '—'}</Text>
          <Text style={styles.infoTexto}>Total: ${Number(pedido.total || 0).toFixed(2)}</Text>
        </View>

        {pasoActivo >= 0 ? (
          <View style={styles.indicador}>
            {PASOS.map((p, i) => (
              <View key={p} style={styles.indicadorItem}>
                <View style={[styles.circulo, i <= pasoActivo && styles.circuloActivo]}>
                  <Text style={styles.circuloTexto}>{i + 1}</Text>
                </View>
                <Text style={styles.indicadorLabel}>{p.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.estadoTexto}>Estado: {estadoActual}</Text>
        )}

        <TablaDetalle columnas={COLUMNAS} datos={items} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { padding: 16, gap: 16 },
  error: { color: '#c62828', textAlign: 'center', paddingHorizontal: 16 },
  infoBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14 },
  infoTexto: { fontSize: 15, fontWeight: 'bold', color: '#1F3864' },
  indicador: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  indicadorItem: { alignItems: 'center', gap: 6 },
  circulo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dddddd', alignItems: 'center', justifyContent: 'center' },
  circuloActivo: { backgroundColor: '#1F3864' },
  circuloTexto: { color: '#ffffff', fontWeight: 'bold' },
  indicadorLabel: { fontSize: 11, color: '#888888', textTransform: 'capitalize' },
  estadoTexto: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', textAlign: 'center' },
})