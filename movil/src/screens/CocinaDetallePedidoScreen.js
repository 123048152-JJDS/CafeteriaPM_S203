import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { obtenerMapaEstados } from '../services/estados'

export default function CocinaDetallePedidoScreen({ onMarcarListo }) {
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

  const cambiarEstado = async (nombreEstado) => {
    setProcesando(true)
    try {
      const mapa = await obtenerMapaEstados(auth?.token)
      const idEstado = mapa[nombreEstado]
      if (!idEstado) throw new Error(`Estado '${nombreEstado}' no configurado en el servidor`)
      await api.patch(`/pedidos/${pedidoId}/estado`, { id_estado_nuevo: idEstado }, auth?.token)

      if (nombreEstado === 'listo') {
        onMarcarListo()
      } else {
        await cargar()
      }
    } catch (e) {
      Alert.alert('No se pudo actualizar el pedido', e.message)
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#1F3864" />
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

  const nombreEstado = pedido.estado_actual?.nombre
  const observaciones = (pedido.detalles || []).flatMap(d => d.observaciones || [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Detalle del Pedido</Text>

        <View style={styles.card}>
          <Text style={styles.mesa}>Mesa {pedido.mesa?.numero ?? '—'}</Text>
          <Text style={styles.numero}>Pedido #{pedido.id} · {nombreEstado}</Text>
        </View>

        {(pedido.detalles || []).map((d) => (
          <View key={d.id} style={styles.fila}>
            <Text style={styles.filaTexto}>{d.producto?.nombre || `Producto #${d.id_producto}`}</Text>
            <Text style={styles.filaTexto}>x{d.cantidad}</Text>
          </View>
        ))}

        {observaciones.length > 0 && (
          <>
            <Text style={styles.subtitulo}>Notas</Text>
            <View style={styles.notas}>
              {observaciones.map((obs, i) => (
                <Text key={i}>{obs}</Text>
              ))}
            </View>
          </>
        )}

        {nombreEstado === 'pendiente' && (
          <Pressable
            style={styles.botonPreparacion}
            onPress={() => cambiarEstado('en_preparacion')}
            disabled={procesando}
          >
            {procesando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>En preparación</Text>}
          </Pressable>
        )}

        {nombreEstado === 'en_preparacion' && (
          <Pressable
            style={styles.botonListo}
            onPress={() => cambiarEstado('listo')}
            disabled={procesando}
          >
            {procesando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Marcar como listo</Text>}
          </Pressable>
        )}

        {nombreEstado !== 'pendiente' && nombreEstado !== 'en_preparacion' && (
          <Text style={styles.avisoFinal}>Este pedido ya no está en la cola de cocina.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 20 },
  error: { color: '#c62828', textAlign: 'center', marginTop: 40, paddingHorizontal: 16 },
  card: { backgroundColor: '#FFF8E8', padding: 16, borderRadius: 12, marginBottom: 20 },
  mesa: { fontSize: 20, fontWeight: 'bold' },
  numero: { marginTop: 4, color: '#555555' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  filaTexto: { fontSize: 15, color: '#333333' },
  subtitulo: { marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 16 },
  notas: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 10, marginBottom: 20 },
  botonPreparacion: { backgroundColor: '#FF9800', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10, marginTop: 10 },
  botonListo: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10, marginTop: 10 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  avisoFinal: { textAlign: 'center', color: '#888888', fontStyle: 'italic', marginTop: 20 },
})