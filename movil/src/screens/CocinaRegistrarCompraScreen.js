import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput } from 'react-native'

const CAMPOS = ['Producto', 'Cantidad', 'Unidad', 'Proveedor', 'Costo']

export default function CocinaRegistrarCompraScreen({ onGuardar }) {
  const [valores, setValores] = useState({})
  const setCampo = (campo, valor) => setValores(v => ({ ...v, [campo]: valor }))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Registrar Compra</Text>
        {CAMPOS.map((label, i) => (
          <View key={i}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={label}
              value={valores[label] || ''}
              onChangeText={(t) => setCampo(label, t)}
              keyboardType={['Cantidad', 'Costo'].includes(label) ? 'numeric' : 'default'}
            />
          </View>
        ))}
        <Pressable style={styles.boton} onPress={onGuardar}>
          <Text style={styles.botonTexto}>Registrar compra</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 20 },
  label: { marginBottom: 6, color: '#666666', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})