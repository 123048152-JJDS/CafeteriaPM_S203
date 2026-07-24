import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native'

const pedidos = [
  { mesa: 'Mesa 03', pedido: '#041', productos: ['2 Café Americano', '1 Sandwich'] },
  { mesa: 'Mesa 05', pedido: '#042', productos: ['1 Pay de Queso', '2 Capuchinos'] },
]

export default function CocinaPedidosScreen({ onVerDetalle }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Pedidos</Text>
        <View style={styles.filtros}>
          <Pressable style={styles.filtroActivo}><Text style={styles.filtroActivoTexto}>Pendientes</Text></Pressable>
          <Pressable style={styles.filtro}><Text style={styles.filtroTexto}>En prep.</Text></Pressable>
          <Pressable style={styles.filtro}><Text style={styles.filtroTexto}>Listos</Text></Pressable>
        </View>
        {pedidos.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitulo}>{item.mesa} {item.pedido}</Text>
            {item.productos.map((p, i) => (
              <Text key={i} style={styles.cardProducto}>• {p}</Text>
            ))}
            <Pressable style={styles.boton} onPress={() => onVerDetalle(item.pedido)}>
              <Text style={styles.botonTexto}>Detalles</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 16 },
  filtros: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filtroActivo: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filtroActivoTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  filtro: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dddddd' },
  filtroTexto: { color: '#555555', fontSize: 13 },
  card: { backgroundColor: '#FFF8E8', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 8, color: '#1F3864' },
  cardProducto: { fontSize: 15, color: '#333333', marginBottom: 4 },
  boton: { backgroundColor: '#1F3864', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold' },
})