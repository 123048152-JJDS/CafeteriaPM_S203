import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import TablaDetalle from '../components/TablaDetalle'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'nombre', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
]

export default function CajaConfirmarPedidoScreen({ onConfirmarCobro }) {
  const { pedidoId } = useLocalSearchParams()
  const { auth } = useAuth()

  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargar = useCallback(async () => {
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

  const marcarEntregado = async () => {
    setProcesando(true)
    try {
      await api.patch(`/pedidos/${pedidoId}/estado`, { id_estado_nuevo: 4 }, auth?.token)
      await cargar()
    } catch (e) {
      Alert.alert('No se pudo actualizar el estado', e.message)
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#314A7E" />
      </SafeAreaView>
    )
  }

  if (error || !pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error || 'Pedido no encontrado'}</Text>
      </SafeAreaView>
    )
  }

  const items = (pedido.detalles || []).map(d => ({
    cantidad: d.cantidad,
    nombre: d.producto?.nombre || `Producto #${d.id_producto}`,
    precio: `$${Number(d.precio_unitario).toFixed(2)}`,
  }))

  const nombreEstado = pedido.estado_actual?.nombre
  const yaFueEntregado = nombreEstado === 'entregado'

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Confirmar · Mesa {pedido.mesa?.numero ?? '—'}</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <TablaDetalle columnas={COLUMNAS} datos={items} />

        {(pedido.detalles || []).some(d => (d.observaciones || []).length > 0) && (
          <View style={styles.nota}>
            {pedido.detalles.flatMap(d => d.observaciones || []).map((obs, i) => (
              <Text key={i} style={styles.notaTexto}>{obs}</Text>
            ))}
          </View>
        )}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalMonto}>${Number(pedido.total || 0).toFixed(2)}</Text>
        </View>

        {!yaFueEntregado && (
          <Pressable style={styles.botonBlanco} onPress={marcarEntregado} disabled={procesando}>
            {procesando ? (
              <ActivityIndicator color="#314A7E" />
            ) : (
              <Text style={styles.botonBlancoTexto}>Marcar entregado</Text>
            )}
          </Pressable>
        )}

        <Pressable style={styles.botonAzul} onPress={() => onConfirmarCobro(pedidoId)}>
          <Text style={styles.botonTexto}>Confirmar cobro</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 16 },
  error: { color: '#c62828', textAlign: 'center', marginTop: 40, paddingHorizontal: 16 },
  nota: { backgroundColor: '#F3F6FA', padding: 12, borderRadius: 10 },
  notaTexto: { fontSize: 14, color: '#555555' },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  totalLabel: { fontSize: 18, color: '#555555' },
  totalMonto: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  botonAzul: { backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonBlanco: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDE5EE', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  botonBlancoTexto: { color: '#314A7E', fontSize: 16 },
})