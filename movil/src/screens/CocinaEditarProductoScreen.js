import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Switch, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CocinaEditarProductoScreen({ onGuardado, onEliminado }) {
  const { id } = useLocalSearchParams()
  const { auth } = useAuth()

  const [producto, setProducto] = useState(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.get(`/productos/${id}`, auth?.token)
        setProducto(data)
        setNombre(data.nombre)
        setPrecio(String(data.precio))
        setDescripcion(data.descripcion || '')
        setDisponible(data.disponible)
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar el producto')
      } finally {
        setCargando(false)
      }
    }
    if (id) cargar()
  }, [id])

  const handleGuardar = async () => {
    const precioNum = parseFloat(precio.replace(',', '.'))
    if (!nombre || isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Datos inválidos', 'Revisa nombre y precio')
      return
    }
    setGuardando(true)
    try {
      await api.patch(`/productos/${id}`, {
        nombre,
        precio: precioNum,
        descripcion,
        disponible,
      }, auth?.token)
      onGuardado()
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = () => {
    Alert.alert('Eliminar producto', '¿Seguro que quieres eliminar este producto?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true)
          try {
            await api.del(`/productos/${id}`, auth?.token)
            onEliminado()
          } catch (e) {
            Alert.alert('No se pudo eliminar', e.message)
          } finally {
            setEliminando(false)
          }
        },
      },
    ])
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
        <Text style={styles.titulo}>Editar producto</Text>
        <Text style={styles.subtitulo}>ID #{id} · {producto?.categoria?.nombre || 'Sin categoría'}</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Precio ($)</Text>
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} multiline />

        {producto?.ingredientes?.length > 0 && (
          <>
            <Text style={styles.label}>Ingredientes</Text>
            <View style={styles.ingredientesBox}>
              {producto.ingredientes.map((ing, i) => (
                <Text key={i} style={styles.ingredienteTexto}>
                  • {ing.nombre} — {ing.cantidad} {ing.unidad}
                </Text>
              ))}
            </View>
          </>
        )}

        <View style={styles.switchContainer}>
          <Switch value={disponible} onValueChange={setDisponible} />
          <Text style={styles.switchTexto}>Disponible en menú</Text>
        </View>

        <Pressable style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Guardar cambios</Text>}
        </Pressable>

        <Pressable style={styles.botonEliminar} onPress={handleEliminar} disabled={eliminando}>
          {eliminando ? (
            <ActivityIndicator color="#c62828" />
          ) : (
            <Text style={styles.botonEliminarTexto}>Eliminar producto</Text>
          )}
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
  ingredientesBox: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 14 },
  ingredienteTexto: { fontSize: 14, color: '#333333', marginBottom: 4 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  switchTexto: { fontSize: 15, color: '#333333' },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonEliminar: { backgroundColor: '#ffffff', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c62828', marginBottom: 12 },
  botonEliminarTexto: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
})