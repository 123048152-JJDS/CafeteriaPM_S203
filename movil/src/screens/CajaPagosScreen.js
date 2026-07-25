import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native'

const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']
const TOTAL = 155.0

export default function CajaPagosScreen({ onPagar }) {
  const [metodo, setMetodo] = useState(null)
  const [montoRecibido, setMontoRecibido] = useState('')

  const monto = parseFloat(montoRecibido.replace(',', '.')) || 0
  const cambio = metodo === 'Efectivo' ? monto - TOTAL : 0
  const esValido = metodo === 'Tarjeta' || metodo === 'Transferencia' || metodo === 'Otro'
    ? true
    : metodo === 'Efectivo' && monto >= TOTAL

  const handleSeleccionar = (m) => {
    setMetodo(m)
    setMontoRecibido('')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pagar · Mesa 01</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.precio}>${TOTAL.toFixed(2)}</Text>

          <View style={styles.metodos}>
            {METODOS.map(m => (
              <Pressable
                key={m}
                style={metodo === m ? styles.metodoActivo : styles.metodo}
                onPress={() => handleSeleccionar(m)}
              >
                <Text style={metodo === m ? styles.metodoTextoActivo : styles.metodoTexto}>{m}</Text>
              </Pressable>
            ))}
          </View>

          {metodo === 'Efectivo' && (
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
                <Text style={monto >= TOTAL ? styles.cambioTexto : styles.cambioTextoInsuficiente}>
                  {monto >= TOTAL
                    ? `Cambio a entregar: $${cambio.toFixed(2)}`
                    : `Falta: $${(TOTAL - monto).toFixed(2)}`}
                </Text>
              )}
            </View>
          )}

          <Pressable
            style={esValido ? styles.botonVerde : styles.botonDeshabilitado}
            disabled={!esValido || !metodo}
            onPress={() => onPagar({ metodo, montoRecibido: metodo === 'Efectivo' ? monto : TOTAL, cambio: metodo === 'Efectivo' ? cambio : 0, total: TOTAL })}
          >
            <Text style={styles.botonTexto}>Pagar / Ticket</Text>
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