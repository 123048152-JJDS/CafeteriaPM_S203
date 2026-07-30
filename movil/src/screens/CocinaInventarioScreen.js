import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CocinaInventarioScreen({ onRegistrarCompra }) {
  const { auth } = useAuth()
  const [ingredientes, setIngredientes] = useState([])
  const [stockBajo, setStockBajo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [todos, bajos] = await Promise.all([
        api.get('/productos/ingredientes', auth?.token),
        api.get('/productos/ingredientes/stock-bajo', auth?.token),
      ])
      setIngredientes(todos)
      setStockBajo(bajos)
    } catch (e) {
      setError(e.message || 'No se pudo cargar el inventario')
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

  const idsStockBajo = new Set(stockBajo.map(i => i.id))

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Inventario</Text>
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
        <Text style={styles.titulo}>Inventario</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        {stockBajo.length > 0 ? (
          <View style={styles.alerta}>
            <Text style={styles.alertaTexto}>⚠ Stock crítico</Text>
            <Text style={styles.alertaTexto}>{stockBajo.map(i => i.nombre).join(', ')}</Text>
          </View>
        ) : (
          <View style={styles.alertaOk}>
            <Text style={styles.alertaOkTexto}>✓ Todo el stock está en buen nivel</Text>
          </View>
        )}

        <View style={styles.encabezado}>
          <Text style={styles.enc}>Ingrediente</Text>
          <Text style={styles.enc}>Unidad</Text>
          <Text style={styles.enc}>Stock</Text>
        </View>

        {ingredientes.map((item) => (
          <View key={item.id} style={styles.fila}>
            <Text style={styles.txt}>{item.nombre}</Text>
            <Text style={styles.txt}>{item.unidad}</Text>
            <Text style={[styles.txt, idsStockBajo.has(item.id) && styles.rojo]}>
              {Number(item.stock_actual).toFixed(1)}
            </Text>
          </View>
        ))}

        <Pressable style={styles.boton} onPress={onRegistrarCompra}>
          <Text style={styles.botonTexto}>Registrar compra</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 20 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
  alerta: { backgroundColor: '#FDECEC', padding: 14, borderRadius: 10, marginBottom: 20 },
  alertaTexto: { color: '#C62828', fontWeight: 'bold' },
  alertaOk: { backgroundColor: '#e8f5e9', padding: 14, borderRadius: 10, marginBottom: 20 },
  alertaOkTexto: { color: '#2e7d32', fontWeight: 'bold' },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  enc: { width: '33%', fontWeight: 'bold', color: '#333333' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  txt: { width: '33%', fontSize: 14, color: '#333333' },
  rojo: { color: '#E53935', fontWeight: 'bold' },
  boton: { backgroundColor: '#1F3864', marginTop: 24, marginBottom: 12, padding: 14, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})