import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native'

const PRODUCTOS_INICIALES = [
  { id: '1', nombre: 'Café', precio: 35, cantidad: 2 },
  { id: '2', nombre: 'Sandwich', precio: 85, cantidad: 1 },
]

export default function CajaModificarPedidoScreen({ onGuardar, onCancelar }) {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES)

  const cambiarCantidad = (id, delta) => {
    setProductos(prev =>
      prev
        .map(p => (p.id === id ? { ...p, cantidad: Math.max(0, p.cantidad + delta) } : p))
        .filter(p => p.cantidad > 0)
    )
  }

  const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0)

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Modificar pedido</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {productos.map(p => (
          <View key={p.id} style={styles.fila}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{p.nombre}</Text>
              <Text style={styles.precio}>${p.precio.toFixed(2)} c/u</Text>
            </View>
            <View style={styles.contador}>
              <Pressable style={styles.contadorBoton} onPress={() => cambiarCantidad(p.id, -1)}>
                <Text style={styles.contadorTexto}>-</Text>
              </Pressable>
              <Text style={styles.cantidad}>{p.cantidad}</Text>
              <Pressable style={styles.contadorBoton} onPress={() => cambiarCantidad(p.id, 1)}>
                <Text style={styles.contadorTexto}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {productos.length === 0 && (
          <Text style={styles.vacio}>No quedan productos en el pedido.</Text>
        )}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalMonto}>${total.toFixed(2)}</Text>
        </View>

        <Pressable style={styles.botonBlanco} onPress={onCancelar}>
          <Text style={styles.botonBlancoTexto}>Cancelar</Text>
        </Pressable>
        <Pressable style={styles.botonAzul} onPress={() => onGuardar(productos, total)}>
          <Text style={styles.botonTexto}>Guardar cambios</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FC', borderRadius: 12, padding: 14 },
  nombre: { fontSize: 15, fontWeight: 'bold', color: '#1B2A41' },
  precio: { fontSize: 12, color: '#777777', marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contadorBoton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#314A7E', alignItems: 'center', justifyContent: 'center' },
  contadorTexto: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  cantidad: { fontSize: 16, fontWeight: 'bold', color: '#1B2A41', minWidth: 20, textAlign: 'center' },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 20 },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  totalLabel: { fontSize: 18, color: '#555555' },
  totalMonto: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  botonAzul: { backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonBlanco: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDE5EE', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  botonBlancoTexto: { color: '#314A7E', fontSize: 16 },
})