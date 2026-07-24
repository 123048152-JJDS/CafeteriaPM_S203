import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Pressable } from 'react-native'

export default function CajaGastosScreen() {
  const [descripcion, setDescripcion] = useState('Compra leche')
  const [monto, setMonto] = useState('85.00')
  const [categoria, setCategoria] = useState('Suministros')
  const [fecha, setFecha] = useState('26 May 2025')

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Registrar gasto</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />
        <Text style={styles.label}>Monto ($)</Text>
        <TextInput style={styles.input} value={monto} onChangeText={setMonto} keyboardType="numeric" />
        <Text style={styles.label}>Categoría</Text>
        <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} />
        <Text style={styles.label}>Fecha</Text>
        <TextInput style={styles.input} value={fecha} onChangeText={setFecha} />
        <Pressable style={styles.boton} onPress={() => {}}>
          <Text style={styles.botonTexto}>Guardar gasto</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { paddingHorizontal: 16, gap: 4, paddingBottom: 24 },
  label: { fontSize: 14, color: '#5C6F88', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#DDE5EE', borderRadius: 10, padding: 12, fontSize: 16 },
  boton: { backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#ffffff', fontSize: 16 },
})