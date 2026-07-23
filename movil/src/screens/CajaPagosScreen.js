import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native'

const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']

export default function CajaPagosScreen({ onPagar }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pagar · Mesa 01</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.precio}>$155.00</Text>
        <View style={styles.metodos}>
          {METODOS.map(m => (
            <Pressable key={m} style={styles.metodo}>
              <Text style={styles.metodoTexto}>{m}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.botonVerde} onPress={onPagar}>
          <Text style={styles.botonTexto}>Pagar / Ticket</Text>
        </Pressable>
      </ScrollView>
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
  metodoTexto: { color: '#314A7E', fontSize: 16 },
  botonVerde: { backgroundColor: '#2F724E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 16 },
})