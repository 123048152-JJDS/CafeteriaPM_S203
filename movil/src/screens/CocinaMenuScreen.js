import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import ProductCard from '../components/ProductCard'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CocinaMenuScreen({ onNuevoProducto, onEditarProducto }) {
  const { auth } = useAuth()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todo')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [prods, cats] = await Promise.all([
        api.get('/productos/', auth?.token),
        api.get('/productos/categorias', auth?.token),
      ])
      setProductos(prods)
      setCategorias(cats.filter(c => c.tipo === 'producto' || c.tipo === 'ambos'))
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los productos')
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

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      if (categoriaActiva !== 'Todo' && p.categoria?.nombre !== categoriaActiva) return false
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [productos, categoriaActiva, busqueda])

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Menú</Text>
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
        <Text style={styles.titulo}>Menú</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.barraSuperior}>
          <TextInput
            placeholder="Buscar producto..."
            style={styles.buscador}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <Pressable style={styles.botonNuevo} onPress={onNuevoProducto}>
            <Text style={styles.botonNuevoTexto}>Nuevo</Text>
          </Pressable>
        </View>

        <View style={styles.categorias}>
          <Pressable
            style={categoriaActiva === 'Todo' ? styles.categoriaActiva : styles.categoria}
            onPress={() => setCategoriaActiva('Todo')}
          >
            <Text style={categoriaActiva === 'Todo' ? styles.categoriaActivaTexto : styles.categoriaTexto}>Todo</Text>
          </Pressable>
          {categorias.map(cat => (
            <Pressable
              key={cat.id}
              style={cat.nombre === categoriaActiva ? styles.categoriaActiva : styles.categoria}
              onPress={() => setCategoriaActiva(cat.nombre)}
            >
              <Text style={cat.nombre === categoriaActiva ? styles.categoriaActivaTexto : styles.categoriaTexto}>
                {cat.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtrados.length === 0 && (
          <Text style={styles.vacio}>No hay productos en esta categoría.</Text>
        )}

        {filtrados.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            nombre={p.nombre}
            categoria={p.categoria?.nombre || 'Sin categoría'}
            precio={Number(p.precio).toFixed(2)}
            disponible={p.disponible}
            onEditar={onEditarProducto}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 16 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
  barraSuperior: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  buscador: { flex: 1, borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 12, fontSize: 14 },
  botonNuevo: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  botonNuevoTexto: { color: '#ffffff', fontWeight: 'bold' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoriaActiva: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoriaActivaTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  categoria: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dddddd' },
  categoriaTexto: { color: '#555555', fontSize: 13 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 20 },
})