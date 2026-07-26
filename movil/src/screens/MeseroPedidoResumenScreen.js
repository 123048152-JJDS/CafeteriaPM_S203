import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import BotonPrimario from '../components/BotonPrimario'
import { usePedidoEnCurso } from '../context/PedidoEnCursoContext'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MeseroPedidoResumenScreen({ onCancelar, onEnviarACaja }) {
  const { mesaId } = useLocalSearchParams()
  const { auth } = useAuth()
  const { items, cambiarCantidad, total, limpiar } = usePedidoEnCurso()
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleCancelar = () => {
    limpiar()
    onCancelar()
  }

  const handleEnviar = async () => {
    if (items.length === 0) return
    setEnviando(true)
    try {
      await api.post('/pedidos/', {
        id_mesa: Number(mesaId),
        detalles: items.map(i => ({
          id_producto: i.id,
          cantidad: i.cantidad,
          observacion: observaciones || undefined,
        })),
      }, auth?.token)
      limpiar()
      onEnviarACaja()
    } catch (e) {
      Alert.alert('No se pudo crear el pedido', e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Resumen del pedido</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <Text style={styles.vacio}>No has agregado productos todavía.</Text>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.precio}>${item.precio.toFixed(2)} c/u</Text>
              </View>
              <View style={styles.contador}>
                <Pressable style={styles.contadorBoton} onPress={() => cambiarCantidad(item.id, -1)}>
                  <Text style={styles.contadorTexto}>-</Text>
                </Pressable>
                <Text style={styles.cantidad}>{item.cantidad}</Text>
                <Pressable style={styles.contadorBoton} onPress={() => cambiarCantidad(item.id, 1)}>
                  <Text style={styles.contadorTexto}>+</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <TextInput
          style={styles.observaciones}
          placeholder="Observaciones..."
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />
        <Text style={styles.total}>Total    ${total.toFixed(2)}</Text>
        <View style={styles.botones}>
          <BotonPrimario titulo="Cancelar" color="#dddddd" onPress={handleCancelar} disabled={enviando} />
          {enviando ? (
            <ActivityIndicator color="#1F3864" />
          ) : (
            <BotonPrimario titulo="Enviar a caja" onPress={handleEnviar} disabled={items.length === 0} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { padding: 16, gap: 12 },
  vacio: { textAlign: 'center', color: '#999999', marginVertical: 20 },
  fila: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FC', borderRadius: 12, padding: 14 },
  nombre: { fontSize: 15, fontWeight: 'bold', color: '#1F3864' },
  precio: { fontSize: 12, color: '#777777', marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contadorBoton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1F3864', alignItems: 'center', justifyContent: 'center' },
  contadorTexto: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  cantidad: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', minWidth: 20, textAlign: 'center' },
  observaciones: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 60, marginTop: 8 },
  total: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', textAlign: 'right' },
  botones: { flexDirection: 'row', gap: 8 },
})