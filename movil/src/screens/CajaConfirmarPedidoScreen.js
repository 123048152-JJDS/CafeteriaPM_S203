import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Button } from 'react-native'
import CajaNavbar from '../components/CajaNavbar'
import TablaDetalle from '../components/TablaDetalle'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'nombre', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
  { label: 'Status', key: 'status', flex: 1 },
]

const PRODUCTOS = [
  { cantidad: '2', nombre: 'Café', precio: '$70', status: 'Listo' },
  { cantidad: '1', nombre: 'Sandwich', precio: '$85', status: 'Listo' },
]

export default function CajaConfirmarPedidoScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Confirmar · Mesa 01</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <TablaDetalle columnas={COLUMNAS} datos={PRODUCTOS} />
        <View style={styles.nota}>
          <Text style={styles.notaTexto}>Sin cebolla</Text>
        </View>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalMonto}>$155.00</Text>
        </View>
        <Pressable style={styles.botonBlanco}>
          <Text style={styles.botonBlancoTexto}>Modificar</Text>
        </Pressable>
        <Pressable style={styles.botonAzul}>
          <Text style={styles.botonTexto}>Confirmar cobro</Text>
        </Pressable>
      </ScrollView>
      <CajaNavbar activo="pedidos" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 16 },
  nota: { backgroundColor: '#F3F6FA', padding: 12, borderRadius: 10 },
  notaTexto: { fontSize: 15, color: '#555555' },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  totalLabel: { fontSize: 18, color: '#555555' },
  totalMonto: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  botonAzul: { backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonBlanco: {
    backgroundColor: '#ffffff', padding: 15, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#DDE5EE',
  },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  botonBlancoTexto: { color: '#314A7E', fontSize: 16 },
})