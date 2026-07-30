import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CajaPagosScreen({ onPagar }) {
  const { pedidoId } = useLocalSearchParams()
  const { auth } = useAuth()

  const [pedido, setPedido] = useState(null)
  const [metodos, setMetodos] = useState([])
  const [metodo, setMetodo] = useState(null)
  const [montoRecibido, setMontoRecibido] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [cobrando, setCobrando] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        setError(null)
        const [ped, mets] = await Promise.all([
          api.get(`/pedidos/${pedidoId}`, auth?.token),
          api.get('/ventas/metodos-pago', auth?.token),
        ])
        setPedido(ped)
        setMetodos(mets)
      } catch (e) {
        setError(e.message || 'No se pudo cargar la información')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [pedidoId, auth?.token])

  const total = Number(pedido?.total || 0)
  const esEfectivo = metodo?.nombre === 'efectivo'
  const monto = parseFloat(montoRecibido.replace(',', '.')) || 0
  const cambio = esEfectivo ? monto - total : 0
  const esValido = metodo && (!esEfectivo || monto >= total)

  const handleSeleccionar = (m) => {
    setMetodo(m)
    setMontoRecibido('')
  }

  const handlePagar = async () => {
    setCobrando(true)
    try {
      const venta = await api.post('/ventas/', {
        id_pedido: Number(pedidoId),
        id_metodo_pago: metodo.id,
        monto_recibido: esEfectivo ? monto : total,
      }, auth?.token)
      onPagar({
        ventaId: venta.id,
        metodo: metodo.nombre,
        montoRecibido: Number(venta.monto_recibido ?? total).toFixed(2),
        cambio: Number(venta.cambio ?? 0).toFixed(2),
        total: Number(venta.monto_total ?? total).toFixed(2),
      })
    } catch (e) {
      Alert.alert('No se pudo registrar el cobro', e.message)
    } finally {
      setCobrando(false)
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#314A7E" />
      </SafeAreaView>
    )
  }

  if (error || !pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error || 'Pedido no encontrado'}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pagar · Mesa {pedido.mesa?.numero ?? '—'}</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.precio}>${total.toFixed(2)}</Text>

          <View style={styles.metodos}>
            {metodos.map(m => (
              <Pressable
                key={m.id}
                style={metodo?.id === m.id ? styles.metodoActivo : styles.metodo}
                onPress={() => handleSeleccionar(m)}
              >
                <Text style={metodo?.id === m.id ? styles.metodoTextoActivo : styles.metodoTexto}>
                  {m.nombre.charAt(0).toUpperCase() + m.nombre.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {esEfectivo && (
            <View style={styles.cajaEfectivo}>
              <Text style={styles.label}>Efectivo recibido</Text>
              <TextInput
                style={styles.inputMonto}
                placeholder="$0.00"
                keyboardType="decimal-pad"
                value={montoRecibido}
                onChangeText={setMontoRecibido}
              />
              {montoRecibido.length > 0 && (
                <Text style={monto >= total ? styles.cambioTexto : styles.cambioTextoInsuficiente}>
                  {monto >= total
                    ? `Cambio a entregar: $${cambio.toFixed(2)}`
                    : `Falta: $${(total - monto).toFixed(2)}`}
                </Text>
              )}
            </View>
          )}

          <Pressable
            style={esValido && !cobrando ? styles.botonVerde : styles.botonDeshabilitado}
            disabled={!esValido || cobrando}
            onPress={handlePagar}
          >
            {cobrando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Pagar / Ticket</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 16 },
  error: { color: '#c62828', textAlign: 'center', marginTop: 40, paddingHorizontal: 16 },
  precio: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1B2A41' },
  metodos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  metodo: { width: '45%', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#DDE5EE', alignItems: 'center' },
  metodoActivo: { width: '45%', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#314A7E', backgroundColor: '#314A7E', alignItems: 'center' },
  metodoTexto: { color: '#314A7E', fontSize: 16 },
  metodoTextoActivo: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cajaEfectivo: { backgroundColor: '#F3F6FA', borderRadius: 12, padding: 16, gap: 8 },
  label: { fontSize: 14, color: '#5C6F88' },
  inputMonto: { borderWidth: 1, borderColor: '#DDE5EE', borderRadius: 10, padding: 14, fontSize: 20, fontWeight: 'bold', color: '#1B2A41', backgroundColor: '#ffffff' },
  cambioTexto: { fontSize: 16, fontWeight: 'bold', color: '#2F724E' },
  cambioTextoInsuficiente: { fontSize: 16, fontWeight: 'bold', color: '#c62828' },
  botonVerde: { backgroundColor: '#2F724E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#c5c5c5', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 16 },
})