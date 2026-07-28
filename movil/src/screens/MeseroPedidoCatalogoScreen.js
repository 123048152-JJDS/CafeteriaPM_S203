import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import BotonPrimario from '../components/BotonPrimario'
import { usePedidoEnCurso } from '../context/PedidoEnCursoContext'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MeseroPedidoCatalogoScreen({ onVerResumen }) {
  const { mesaId } = useLocalSearchParams()
  const { auth } = useAuth()
  const {
    items,
    agregarProducto,
    cambiarCantidad,
    cantidadTotal,
    total,
    iniciarParaMesa,
  } = usePedidoEnCurso()

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtro, setFiltro] = useState('Todo')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Fix bug 1: si esta mesa es distinta a la que tenía el carrito activo,
  // se limpia automáticamente para no mezclar productos entre mesas.
  useEffect(() => {
    if (mesaId) iniciarParaMesa(mesaId)
  }, [mesaId])

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [prods, cats] = await Promise.all([
        api.get('/productos/?disponible=true', auth?.token),
        api.get('/productos/categorias', auth?.token),
      ])
      setProductos(prods)
      setCategorias(cats.filter(c => c.tipo === 'producto' || c.tipo === 'ambos'))
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los productos')
    } finally {
      setCargando(false)
    }
  }, [auth?.token])

  useEffect(() => { cargar() }, [cargar])

  const cantidadEnCarrito = (id) => items.find(i => i.id === id)?.cantidad || 0

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      if (filtro !== 'Todo' && p.categoria?.nombre !== filtro) return false
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [productos, filtro, busqueda])

  const handleAgregar = (producto) => {
    agregarProducto({ id: producto.id, nombre: producto.nombre, precio: Number(producto.precio) })
  }

  const renderProducto = ({ item }) => {
    const enCarrito = cantidadEnCarrito(item.id)
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardNombre}>{item.nombre}</Text>
          <Text style={styles.cardPrecio}>${Number(item.precio).toFixed(2)}</Text>
        </View>
        {enCarrito > 0 && (
          <Pressable style={styles.cardBotonMenos} onPress={() => cambiarCantidad(item.id, -1)}>
            <Text style={styles.cardBotonMenosTexto}>-</Text>
          </Pressable>
        )}
        {enCarrito > 0 && <Text style={styles.cardCantidad}>{enCarrito}</Text>}
        <Pressable style={styles.cardBoton} onPress={() => handleAgregar(item)}>
          <Text style={styles.cardBotonTexto}>+</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Nuevo pedido {mesaId ? `· Mesa ${mesaId}` : ''}</Text>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar producto..."
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <View style={styles.filtros}>
        <Pressable
          style={filtro === 'Todo' ? styles.filtroBotonActivo : styles.filtroBoton}
          onPress={() => setFiltro('Todo')}
        >
          <Text style={filtro === 'Todo' ? styles.filtroTextoActivo : styles.filtroTexto}>Todo</Text>
        </Pressable>
        {categorias.map(c => (
          <Pressable
            key={c.id}
            style={filtro === c.nombre ? styles.filtroBotonActivo : styles.filtroBoton}
            onPress={() => setFiltro(c.nombre)}
          >
            <Text style={filtro === c.nombre ? styles.filtroTextoActivo : styles.filtroTexto}>{c.nombre}</Text>
          </Pressable>
        ))}
      </View>

      {cargando ? (
        <ActivityIndicator color="#1F3864" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={item => String(item.id)}
          renderItem={renderProducto}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vacio}>No hay productos en esta categoría.</Text>}
        />
      )}

      <View style={styles.botonContainer}>
        <BotonPrimario
          titulo={cantidadTotal > 0 ? `Ver resumen (${cantidadTotal}) · $${total.toFixed(2)}` : 'Ver resumen'}
          onPress={onVerResumen}
          disabled={cantidadTotal === 0}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', padding: 20, paddingBottom: 12 },
  buscador: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  filtroBoton: {
    height: 34,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
  },
  filtroBotonActivo: {
    height: 34,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1F3864',
    alignSelf: 'flex-start',
  },
  filtroTexto: { fontSize: 13, color: '#555555' },
  filtroTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  error: { color: '#c62828', textAlign: 'center', marginTop: 20 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 20 },
  lista: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eeeeee', gap: 10 },
  cardNombre: { fontSize: 15, fontWeight: '500', color: '#333333' },
  cardPrecio: { fontSize: 14, color: '#1F3864', fontWeight: 'bold' },
  cardCantidad: { fontSize: 15, fontWeight: 'bold', color: '#1F3864', minWidth: 16, textAlign: 'center' },
  cardBoton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1F3864', alignItems: 'center', justifyContent: 'center' },
  cardBotonTexto: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  cardBotonMenos: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dddddd', alignItems: 'center', justifyContent: 'center' },
  cardBotonMenosTexto: { color: '#333333', fontSize: 20, fontWeight: 'bold' },
  botonContainer: { marginHorizontal: 16, marginVertical: 8 },
})