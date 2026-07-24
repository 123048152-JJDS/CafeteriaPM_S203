import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Switch } from 'react-native'

const CAMPOS = [
  { label: 'Nombre', placeholder: 'Capuchino' },
  { label: 'Precio ($)', placeholder: '65', numeric: true },
  { label: 'Categoría', placeholder: 'Bebidas' },
  { label: 'Ingredientes', placeholder: 'Café, Leche' },
]

export default function CocinaNuevoProductoScreen({ onGuardar }) {
  const [disponible, setDisponible] = useState(true)
  const [valores, setValores] = useState({})
  const setCampo = (campo, valor) => setValores(v => ({ ...v, [campo]: valor }))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Nuevo producto</Text>
        {CAMPOS.map((field, i) => (
          <View key={i}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              value={valores[field.label] || ''}
              onChangeText={(t) => setCampo(field.label, t)}
              keyboardType={field.numeric ? 'numeric' : 'default'}
            />
          </View>
        ))}
        <View style={styles.switchContainer}>
          <Switch value={disponible} onValueChange={setDisponible} />
          <Text style={styles.switchTexto}>Disponible en menú</Text>
        </View>
        <Pressable style={styles.boton} onPress={onGuardar}>
          <Text style={styles.botonTexto}>Guardar producto</Text>
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
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  switchTexto: { fontSize: 15, color: '#333333' },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})