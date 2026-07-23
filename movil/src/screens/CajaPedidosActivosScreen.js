import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native'

const PEDIDOS = [
  { id: '039', mesa: 'Mesa 01', estado: 'Listo', productos: '2 Café · 1 Sandwich' },
  { id: '040', mesa: 'Mesa 05', estado: 'Cocina', productos: '3 Capuchino · 2 Pay' },
]

export default function CajaPedidosActivosScreen({ onVerDetalle }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pedidos activos</Text>
      <FlatList
        data={PEDIDOS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={item.estado === 'Listo' ? styles.cardVerde : styles.card}>
            <Text style={styles.cardTitulo}>{item.mesa} #{item.id}</Text>
            <Text style={item.estado === 'Listo' ? styles.estadoListo : styles.estadoCocina}>
              {item.estado}
            </Text>
            <Text style={styles.productos}>{item.productos}</Text>
            <Pressable style={styles.boton} onPress={() => onVerDetalle(item.id)}>
              <Text style={styles.botonTexto}>Detalle</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  lista: { paddingHorizontal: 16, gap: 12 },
  card: { backgroundColor: '#F7F9FC', padding: 16, borderRadius: 15 },
  cardVerde: { backgroundColor: '#E6F2EE', padding: 16, borderRadius: 15 },
  cardTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1B2A41' },
  estadoListo: { color: '#2E7D4F', fontSize: 16, marginVertical: 4 },
  estadoCocina: { color: '#F28C00', fontSize: 16, marginVertical: 4 },
  productos: { fontSize: 15, color: '#555555', marginBottom: 12 },
  boton: { backgroundColor: '#314A7E', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 15 },
})