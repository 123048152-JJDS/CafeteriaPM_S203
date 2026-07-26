import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COLORES = {
  disponible: { bg: '#e8f5e9', border: '#4caf50', texto: '#2e7d32' },
  ocupada:    { bg: '#ffebee', border: '#ef5350', texto: '#c62828' },
  reservada:  { bg: '#fff8e1', border: '#ffc107', texto: '#f57f17' },
}

const ETIQUETA_BOTON = {
  disponible: 'Nuevo pedido',
  ocupada: 'Ver pedido',
  reservada: 'Ver reserva',
}

export default function MeseroMesasScreen({ onSeleccionarMesa }) {
  const { auth } = useAuth()
  const [mesas, setMesas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargarMesas = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get('/mesas/', auth?.token)
      setMesas(data)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las mesas')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [auth?.token])

  useFocusEffect(
    useCallback(() => {
      cargarMesas()
    }, [cargarMesas])
  )

  const onRefresh = () => {
    setRefrescando(true)
    cargarMesas()
  }

  const renderMesa = ({ item }) => {
    const color = COLORES[item.estado] || COLORES.disponible
    return (
      <View style={[styles.card, { backgroundColor: color.bg, borderColor: color.border }]}>
        <Text style={[styles.cardNumero, { color: color.texto }]}>
          {String(item.numero).padStart(2, '0')}
        </Text>
        <Text style={styles.cardCapacidad}>{item.capacidad} p.</Text>
        <Pressable
          style={[styles.cardBoton, { backgroundColor: color.border }]}
          onPress={() => onSeleccionarMesa(item.id, item.estado, item.pedido_activo_id)}
        >
          <Text style={styles.cardBotonTexto}>{ETIQUETA_BOTON[item.estado] || 'Ver'}</Text>
        </Pressable>
      </View>
    )
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Seleccionar mesa</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Seleccionar mesa</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={mesas}
        keyExtractor={item => String(item.id)}
        numColumns={3}
        renderItem={renderMesa}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.vacio}>No hay mesas registradas.</Text>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 40 },
  grid: { paddingHorizontal: 12, flexGrow: 1 },
  card: { flex: 1, margin: 6, borderRadius: 12, borderWidth: 1.5, padding: 10, alignItems: 'center', gap: 4 },
  cardNumero: { fontSize: 20, fontWeight: 'bold' },
  cardCapacidad: { fontSize: 12, color: '#888888' },
  cardBoton: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 6, marginTop: 4 },
  cardBotonTexto: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
})