import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput } from 'react-native'
import ProductCard from '../components/ProductCard'

const productos = [
  { id: 1, nombre: 'Café Americano', categoria: 'Bebidas', precio: 45 },
  { id: 2, nombre: 'Sandwich', categoria: 'Comida', precio: 65 },
  { id: 3, nombre: 'Pay de Queso', categoria: 'Postres', precio: 55 },
]

export default function CocinaMenuScreen({ onNuevoProducto }) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todo')
  const categorias = ['Todo', 'Bebidas', 'Comida', 'Postres']
  const filtrados = categoriaActiva === 'Todo' ? productos : productos.filter(p => p.categoria === categoriaActiva)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Menú</Text>
        <View style={styles.barraSuperior}>
          <TextInput placeholder="Buscar producto..." style={styles.buscador} />
          <Pressable style={styles.botonNuevo} onPress={onNuevoProducto}>
            <Text style={styles.botonNuevoTexto}>Nuevo</Text>
          </Pressable>
        </View>
        <View style={styles.categorias}>
          {categorias.map(cat => (
            <Pressable
              key={cat}
              style={cat === categoriaActiva ? styles.categoriaActiva : styles.categoria}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Text style={cat === categoriaActiva ? styles.categoriaActivaTexto : styles.categoriaTexto}>{cat}</Text>
            </Pressable>
          ))}
        </View>
        {filtrados.map(p => (
          <ProductCard key={p.id} nombre={p.nombre} categoria={p.categoria} precio={p.precio} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 16 },
  barraSuperior: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  buscador: { flex: 1, borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 12, fontSize: 14 },
  botonNuevo: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  botonNuevoTexto: { color: '#ffffff', fontWeight: 'bold' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoriaActiva: { backgroundColor: '#1F3864', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoriaActivaTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  categoria: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dddddd' },
  categoriaTexto: { color: '#555555', fontSize: 13 },
})