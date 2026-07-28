import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADOS_INFO = {
  pendiente:      { label: 'Pendiente',      color: '#f57f17', bg: '#fff8e1' },
  en_preparacion: { label: 'En preparación', color: '#e65100', bg: '#fff3e0' },
  listo:          { label: 'Listo',          color: '#2e7d32', bg: '#e8f5e9' },
  entregado:      { label: 'Entregado',      color: '#1565c0', bg: '#e3f2fd' },
}

export default function CajaPedidosActivosScreen({ onVerDetalle }) {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargarPedidos = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get('/pedidos/', auth?.token)
      // Filtrar solo pedidos cobrables / activos en caja (pendiente, en_preparacion, listo, entregado)
      const activos = (data || []).filter(p =>
        ['pendiente', 'en_preparacion', 'listo', 'entregado'].includes(p.estado_actual?.nombre)
      )
      setPedidos(activos)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los pedidos activos')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [auth?.token])

  useFocusEffect(useCallback(() => { cargarPedidos() }, [cargarPedidos]))

  const onRefresh = () => {
    setRefrescando(true)
    cargarPedidos()
  }

  const renderPedido = ({ item }) => {
    const estadoNombre = item.estado_actual?.nombre || 'pendiente'
    const info = ESTADOS_INFO[estadoNombre] || { label: estadoNombre, color: '#555555', bg: '#F7F9FC' }
    const productosTexto = (item.detalles || [])
      .map(d => `${d.cantidad} ${d.producto?.nombre || `Prod #${d.id_producto}`}`)
      .join(' · ') || 'Sin productos'

    return (
      <View style={[styles.card, { backgroundColor: info.bg }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitulo}>Mesa {item.id_mesa ?? '--'} · #{item.id}</Text>
          <Text style={[styles.estadoTag, { color: info.color }]}>{info.label}</Text>
        </View>
        <Text style={styles.productos} numberOfLines={2}>{productosTexto}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.totalTexto}>Total: ${Number(item.total || 0).toFixed(2)}</Text>
          <Pressable style={styles.boton} onPress={() => onVerDetalle(item.id)}>
            <Text style={styles.botonTexto}>Detalle / Cobrar</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pedidos activos en caja</Text>

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B2A41" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.lista}
          renderItem={renderPedido}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.vacio}>No hay pedidos activos por cobrar.</Text>}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  lista: { paddingHorizontal: 16, gap: 12, paddingBottom: 20 },
  error: { color: '#c62828', textAlign: 'center', marginHorizontal: 16, marginTop: 20 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 40, fontSize: 15 },
  card: { padding: 16, borderRadius: 15, gap: 8, borderWidth: 1, borderColor: '#eeeeee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1B2A41' },
  estadoTag: { fontSize: 14, fontWeight: 'bold' },
  productos: { fontSize: 14, color: '#555555' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalTexto: { fontSize: 16, fontWeight: 'bold', color: '#1B2A41' },
  boton: { backgroundColor: '#314A7E', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  botonTexto: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
})