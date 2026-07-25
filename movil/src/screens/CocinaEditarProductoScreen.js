import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Switch } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function CocinaEditarProductoScreen({ onGuardar, onEliminar }) {
  const { id, nombre: nombreInicial, categoria: categoriaInicial, precio: precioInicial } = useLocalSearchParams()

  const [nombre, setNombre] = useState(nombreInicial || '')
  const [precio, setPrecio] = useState(String(precioInicial || ''))
  const [categoria, setCategoria] = useState(categoriaInicial || '')
  const [ingredientes, setIngredientes] = useState('')
  const [disponible, setDisponible] = useState(true)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Editar producto</Text>
        <Text style={styles.subtitulo}>ID #{id}</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Precio ($)</Text>
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />

        <Text style={styles.label}>Categoría</Text>
        <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} />

        <Text style={styles.label}>Ingredientes</Text>
        <TextInput style={styles.input} value={ingredientes} onChangeText={setIngredientes} placeholder="Café, Leche" />

        <View style={styles.switchContainer}>
          <Switch value={disponible} onValueChange={setDisponible} />
          <Text style={styles.switchTexto}>Disponible en menú</Text>
        </View>

        <Pressable style={styles.boton} onPress={() => onGuardar({ id, nombre, precio, categoria, disponible })}>
          <Text style={styles.botonTexto}>Guardar cambios</Text>
        </Pressable>

        <Pressable style={styles.botonEliminar} onPress={() => onEliminar(id)}>
          <Text style={styles.botonEliminarTexto}>Eliminar producto</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864' },
  subtitulo: { fontSize: 13, color: '#888888', marginBottom: 20 },
  label: { marginBottom: 6, color: '#666666', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  switchTexto: { fontSize: 15, color: '#333333' },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonEliminar: { backgroundColor: '#ffffff', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c62828', marginBottom: 12 },
  botonEliminarTexto: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
})