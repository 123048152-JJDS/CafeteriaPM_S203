import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Switch, ActivityIndicator, Alert } from 'react-native'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CocinaNuevoProductoScreen({ onGuardado }) {
  const { auth } = useAuth()
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [disponible, setDisponible] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const cats = await api.get('/productos/categorias', auth?.token)
        const deProducto = cats.filter(c => c.tipo === 'producto' || c.tipo === 'ambos')
        setCategorias(deProducto)
        if (deProducto.length > 0) setCategoriaId(deProducto[0].id)
      } catch {
        // el picker queda vacío si falla
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [auth?.token])

  const handleGuardar = async () => {
    const precioNum = parseFloat(precio.replace(',', '.'))
    if (!nombre || isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Datos inválidos', 'Revisa nombre y precio')
      return
    }
    setGuardando(true)
    try {
      await api.post('/productos/', {
        nombre,
        descripcion,
        precio: precioNum,
        id_categoria: categoriaId,
        disponible,
        ingredientes: [], // los ingredientes se pueden asociar después desde Editar
      }, auth?.token)
      onGuardado()
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Nuevo producto</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Capuchino" />

        <Text style={styles.label}>Precio ($)</Text>
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" placeholder="65" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Espresso con leche espumada" multiline />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categorias}>
          {categorias.map(c => (
            <Pressable
              key={c.id}
              style={categoriaId === c.id ? styles.categoriaActiva : styles.categoria}
              onPress={() => setCategoriaId(c.id)}
            >
              <Text style={categoriaId === c.id ? styles.categoriaTextoActivo : styles.categoriaTexto}>{c.nombre}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchContainer}>
          <Switch value={disponible} onValueChange={setDisponible} />
          <Text style={styles.switchTexto}>Disponible en menú</Text>
        </View>

        <Text style={styles.aviso}>
          Los ingredientes se pueden asociar después de crear el producto, desde "Editar".
        </Text>

        <Pressable style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Guardar producto</Text>}
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
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  categoria: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#dddddd' },
  categoriaActiva: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1F3864' },
  categoriaTexto: { fontSize: 13, color: '#555555' },
  categoriaTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  switchTexto: { fontSize: 15, color: '#333333' },
  aviso: { fontSize: 12, color: '#888888', fontStyle: 'italic', marginBottom: 16 },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})