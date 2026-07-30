import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADOS_INFO = {
  listo:     { label: 'Listo',     color: '#1565c0', bg: '#e3f2fd' },
  entregado: { label: 'Entregado', color: '#2e7d32', bg: '#e8f5e9' },
}

export default function CajaPedidosActivosScreen({ onVerDetalle }) {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get('/pedidos/', auth?.token)
      const cobrables = data.filter(p =>
        ['listo', 'entregado'].includes(p.estado_actual?.nombre)
      )
      setPedidos(cobrables)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los pedidos')
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

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Pedidos activos</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#314A7E" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pedidos activos</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={pedidos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.vacio}>No hay pedidos listos para cobrar.</Text>}
        renderItem={({ item }) => {
          const info = ESTADOS_INFO[item.estado_actual?.nombre] || ESTADOS_INFO.listo
          const resumenProductos = (item.detalles || [])
            .map(d => `${d.cantidad} ${d.producto?.nombre || 'Producto'}`)
            .join(' · ')
          return (
            <View style={[item.estado_actual?.nombre === 'listo' ? styles.cardAzul : styles.cardVerde]}>
              <Text style={styles.cardTitulo}>Mesa {item.mesa?.numero ?? '—'} #{item.id}</Text>
              <Text style={[styles.cardEstado, { color: info.color }]}>{info.label}</Text>
              <Text style={styles.productos} numberOfLines={2}>{resumenProductos || 'Sin productos'}</Text>
              <Text style={styles.total}>${Number(item.total || 0).toFixed(2)}</Text>
              <Pressable style={styles.boton} onPress={() => onVerDetalle(item.id)}>
                <Text style={styles.botonTexto}>Detalle</Text>
              </Pressable>
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 40 },
  lista: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },
  cardAzul: { backgroundColor: '#e3f2fd', padding: 16, borderRadius: 15 },
  cardVerde: { backgroundColor: '#E6F2EE', padding: 16, borderRadius: 15 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1B2A41' },
  cardEstado: { fontSize: 14, fontWeight: 'bold', marginVertical: 4 },
  productos: { fontSize: 13, color: '#555555', marginBottom: 8 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#1B2A41', marginBottom: 10 },
  boton: { backgroundColor: '#314A7E', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 15 },
})