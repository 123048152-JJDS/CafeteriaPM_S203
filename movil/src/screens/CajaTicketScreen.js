import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CajaTicketScreen({ onIrAPedidos }) {
  const { pedidoId, metodo, montoRecibido, cambio, total } = useLocalSearchParams()
  const { auth } = useAuth()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.get(`/pedidos/${pedidoId}`, auth?.token)
        setPedido(data)
      } catch {
        setPedido(null)
      } finally {
        setCargando(false)
      }
    }
    if (pedidoId) cargar()
    else setCargando(false)
  }, [pedidoId, auth?.token])

  const items = pedido?.detalles || []

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Ticket {pedido ? `#${pedido.id}` : ''}</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.negocio}>CafeteriaPM</Text>
        <Text style={styles.mesa}>{pedido?.mesa ? `Mesa ${pedido.mesa.numero}` : ''}</Text>
        <View style={styles.linea} />

        {cargando ? (
          <ActivityIndicator color="#314A7E" />
        ) : (
          items.map(d => (
            <View key={d.id} style={styles.fila}>
              <Text style={styles.filaTexto}>{d.cantidad}x {d.producto?.nombre || `Producto #${d.id_producto}`}</Text>
              <Text style={styles.filaTexto}>${(Number(d.precio_unitario) * d.cantidad).toFixed(2)}</Text>
            </View>
          ))
        )}

        <View style={styles.linea} />
        <Text style={styles.total}>Total ${total ?? '0.00'}</Text>

        <View style={styles.pagoInfo}>
          <Text style={styles.pagoTexto}>Método: {metodo ?? '—'}</Text>
          {metodo === 'efectivo' && (
            <>
              <Text style={styles.pagoTexto}>Recibido: ${montoRecibido}</Text>
              <Text style={styles.pagoTextoDestacado}>Cambio: ${cambio}</Text>
            </>
          )}
        </View>

        <Pressable style={styles.botonBlanco}>
          <Text style={styles.botonBlancoTexto}>Imprimir</Text>
        </Pressable>
        <Pressable style={styles.botonBlanco}>
          <Text style={styles.botonBlancoTexto}>Compartir</Text>
        </Pressable>
        <Pressable style={styles.botonAzul} onPress={onIrAPedidos}>
          <Text style={styles.botonTexto}>Ir a Pedidos</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 12, alignItems: 'center' },
  negocio: { fontSize: 24, fontWeight: 'bold', color: '#1B2A41' },
  mesa: { fontSize: 18, color: '#555555' },
  linea: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#DDE5EE' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  filaTexto: { fontSize: 16, color: '#333333' },
  total: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  pagoInfo: { width: '100%', backgroundColor: '#F3F6FA', borderRadius: 10, padding: 14, gap: 4 },
  pagoTexto: { fontSize: 14, color: '#555555' },
  pagoTextoDestacado: { fontSize: 16, fontWeight: 'bold', color: '#2F724E' },
  botonBlanco: { width: '100%', backgroundColor: '#ffffff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDE5EE' },
  botonAzul: { width: '100%', backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  botonBlancoTexto: { color: '#314A7E', fontSize: 16 },
})