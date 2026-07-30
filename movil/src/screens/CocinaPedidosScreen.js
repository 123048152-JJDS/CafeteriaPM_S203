import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const FILTROS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'en_preparacion', label: 'En prep.' },
]

function minutosDesde(fechaISO) {
  const diffMs = Date.now() - new Date(fechaISO).getTime()
  return Math.max(0, Math.floor(diffMs / 60000))
}

export default function CocinaPedidosScreen({ onVerDetalle }) {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)
  const [filtroActivo, setFiltroActivo] = useState('pendiente')

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get('/pedidos/cola-cocina', auth?.token)
      setPedidos(data)
    } catch (e) {
      setError(e.message || 'No se pudo cargar la cola de cocina')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [auth?.token])

  useFocusEffect(useCallback(() => { cargar() }, [cargar]))

  const onRefresh = () => {
    setRefrescando(true)
    cargar()
  }

  const filtrados = useMemo(
    () => pedidos.filter(p => p.estado_actual?.nombre === filtroActivo),
    [pedidos, filtroActivo]
  )

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Pedidos</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        <Text style={styles.titulo}>Pedidos</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.filtros}>
          {FILTROS.map(f => (
            <Pressable
              key={f.key}
              style={filtroActivo === f.key ? styles.filtroActivo : styles.filtro}
              onPress={() => setFiltroActivo(f.key)}
            >
              <Text style={filtroActivo === f.key ? styles.filtroActivoTexto : styles.filtroTexto}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtrados.length === 0 && (
          <Text style={styles.vacio}>No hay pedidos en este estado.</Text>
        )}

        {filtrados.map((item) => {
          const minutos = minutosDesde(item.created_at)
          const esUrgente = minutos >= 15
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>Mesa {item.mesa?.numero ?? '—'} #{item.id}</Text>
                <Text style={esUrgente ? styles.tiempoUrgente : styles.tiempoNormal}>hace {minutos} min</Text>
              </View>
              {(item.detalles || []).map((d, i) => (
                <Text key={i} style={styles.cardProducto}>
                  • {d.cantidad} {d.producto?.nombre || `Producto #${d.id_producto}`}
                </Text>
              ))}
              <Pressable style={styles.boton} onPress={() => onVerDetalle(item.id)}>
                <Text style={styles.botonTexto}>Detalles</Text>
              </Pressable>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 24 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 16 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
  filtros: { flexDirection: 'row', gap: 8, marginBottom: 20, alignItems: 'flex-start' },
  filtroActivo: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  filtroActivoTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  filtro: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dddddd', alignSelf: 'flex-start' },
  filtroTexto: { color: '#555555', fontSize: 13 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 20 },
  card: { backgroundColor: '#FFF8E8', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitulo: { fontSize: 17, fontWeight: 'bold', color: '#1F3864' },
  tiempoNormal: { fontSize: 12, color: '#888888' },
  tiempoUrgente: { fontSize: 12, color: '#c62828', fontWeight: 'bold' },
  cardProducto: { fontSize: 15, color: '#333333', marginBottom: 4 },
  boton: { backgroundColor: '#1F3864', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold' },
})