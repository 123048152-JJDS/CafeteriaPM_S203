import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import BotonPrimario from '../components/BotonPrimario'
import { usePedidoEnCurso } from '../context/PedidoEnCursoContext'

const PRODUCTOS = [
  { id: '1', nombre: 'Café Americano', precio: 35, categoria: 'Bebidas' },
  { id: '2', nombre: 'Sandwich Club', precio: 85, categoria: 'Comida' },
  { id: '3', nombre: 'Café Frappé', precio: 45, categoria: 'Bebidas' },
  { id: '4', nombre: 'Ensalada César', precio: 75, categoria: 'Comida' },
  { id: '5', nombre: 'Brownie', precio: 40, categoria: 'Postres' },
  { id: '6', nombre: 'Capuchino', precio: 40, categoria: 'Bebidas' },
]

const FILTROS = ['Todo', 'Bebidas', 'Comida', 'Postres']

export default function MeseroPedidoCatalogoScreen({ onVerResumen }) {
  const { mesaId } = useLocalSearchParams()
  const { items, agregarProducto, cambiarCantidad, cantidadTotal, total } = usePedidoEnCurso()
  const [filtro, setFiltro] = useState('Todo')
  const [busqueda, setBusqueda] = useState('')

  const cantidadEnCarrito = (id) => items.find(i => i.id === id)?.cantidad || 0

  const filtrados = useMemo(() => {
    return PRODUCTOS.filter(p => {
      if (filtro !== 'Todo' && p.categoria !== filtro) return false
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    })
  }, [filtro, busqueda])

  const renderProducto = ({ item }) => {
    const enCarrito = cantidadEnCarrito(item.id)
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardNombre}>{item.nombre}</Text>
          <Text style={styles.cardPrecio}>${item.precio}</Text>
        </View>
        {enCarrito > 0 && (
          <Pressable style={styles.cardBotonMenos} onPress={() => cambiarCantidad(item.id, -1)}>
            <Text style={styles.cardBotonMenosTexto}>-</Text>
          </Pressable>
        )}
        {enCarrito > 0 && <Text style={styles.cardCantidad}>{enCarrito}</Text>}
        <Pressable style={styles.cardBoton} onPress={() => agregarProducto(item)}>
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
        {FILTROS.map(f => (
          <Pressable
            key={f}
            style={filtro === f ? styles.filtroBotonActivo : styles.filtroBoton}
            onPress={() => setFiltro(f)}
          >
            <Text style={filtro === f ? styles.filtroTextoActivo : styles.filtroTexto}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={item => item.id}
        renderItem={renderProducto}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos en esta categoría.</Text>}
      />
      <View style={styles.botonContainer}>
        <BotonPrimario
          titulo={cantidadTotal > 0 ? `Ver resumen (${cantidadTotal}) · $${total.toFixed(2)}` : 'Ver resumen'}
          onPress={onVerResumen}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', padding: 20, paddingBottom: 12 },
  buscador: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  filtroBoton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f5f5f5', alignSelf: 'flex-start' },
  filtroBotonActivo: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1F3864', alignSelf: 'flex-start' },
  filtroTexto: { fontSize: 13, color: '#555555' },
  filtroTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
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