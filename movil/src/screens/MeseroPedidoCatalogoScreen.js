import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput, Button } from 'react-native'
import MeseroNavbar from '../components/MeseroNavbar'
import BotonPrimario from '../components/BotonPrimario'

const PRODUCTOS = [
  { id: '1', nombre: 'Café Americano', precio: 35 },
  { id: '2', nombre: 'Sandwich Club', precio: 85 },
  { id: '3', nombre: 'Café Frappé', precio: 45 },
  { id: '4', nombre: 'Ensalada César', precio: 75 },
  { id: '5', nombre: 'Brownie', precio: 40 },
  { id: '6', nombre: 'Capuchino', precio: 40 },
]

const FILTROS = ['Todo', 'Bebidas', 'Comida', 'Postres']

export default function MeseroPedidoCatalogoScreen({ setScreen }) {
  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardNombre}>{item.nombre}</Text>
        <Text style={styles.cardPrecio}>${item.precio}</Text>
      </View>
      <Pressable style={styles.cardBoton}>
        <Text style={styles.cardBotonTexto}>+</Text>
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Nuevo pedido</Text>
      <TextInput style={styles.buscador} placeholder="Buscar producto..." />
      <View style={styles.filtros}>
        {FILTROS.map(f => (
          <Pressable key={f} style={styles.filtroBoton}>
            <Text style={styles.filtroTexto}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={PRODUCTOS}
        keyExtractor={item => item.id}
        renderItem={renderProducto}
        contentContainerStyle={styles.lista}
      />
      <View style={styles.botonContainer}>
        <BotonPrimario titulo="Ver resumen" />
      </View>
      <MeseroNavbar activo="pedidos" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  buscador: {
    marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#dddddd',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, fontSize: 14,
  },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filtroBoton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f5f5f5' },
  filtroTexto: { fontSize: 13, color: '#555555' },
  lista: { paddingHorizontal: 16, gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
    borderRadius: 10, backgroundColor: '#f9f9f9',
    borderWidth: 1, borderColor: '#eeeeee',
  },
  cardNombre: { fontSize: 15, fontWeight: '500', color: '#333333' },
  cardPrecio: { fontSize: 14, color: '#1F3864', fontWeight: 'bold' },
  cardBoton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1F3864', alignItems: 'center', justifyContent: 'center',
  },
  cardBotonTexto: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  botonContainer: { marginHorizontal: 16, marginVertical: 8 },
})