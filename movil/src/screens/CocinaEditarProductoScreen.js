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

  // Ingredientes
  const [ingredientesProducto, setIngredientesProducto] = useState([]) // [{id_ingrediente, nombre, unidad, cantidad}]
  const [catalogoIngredientes, setCatalogoIngredientes] = useState([])
  const [ingredienteNuevoId, setIngredienteNuevoId] = useState(null)
  const [cantidadNueva, setCantidadNueva] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const [data, todos] = await Promise.all([
          api.get(`/productos/${id}`, auth?.token),
          api.get('/productos/ingredientes', auth?.token),
        ])
        setProducto(data)
        setNombre(data.nombre)
        setPrecio(String(data.precio))
        setDescripcion(data.descripcion || '')
        setDisponible(data.disponible)
        setIngredientesProducto(
          (data.ingredientes || []).map(i => ({ ...i, cantidad: String(i.cantidad) }))
        )
        setCatalogoIngredientes(todos)
        if (todos.length > 0) setIngredienteNuevoId(todos[0].id)
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar el producto')
      } finally {
        setCargando(false)
      }
    }
    if (id) cargar()
  }, [id])

  const actualizarCantidad = (idIngrediente, valor) => {
    setIngredientesProducto(prev =>
      prev.map(i => (i.id_ingrediente === idIngrediente ? { ...i, cantidad: valor } : i))
    )
  }

  const quitarIngrediente = (idIngrediente) => {
    setIngredientesProducto(prev => prev.filter(i => i.id_ingrediente !== idIngrediente))
  }

  const agregarIngrediente = () => {
    if (!ingredienteNuevoId || !cantidadNueva) {
      Alert.alert('Faltan datos', 'Selecciona un ingrediente y una cantidad')
      return
    }
    const cantidadNum = parseFloat(cantidadNueva.replace(',', '.'))
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Cantidad inválida', 'Debe ser mayor a 0')
      return
    }
    if (ingredientesProducto.some(i => i.id_ingrediente === ingredienteNuevoId)) {
      Alert.alert('Ya agregado', 'Este ingrediente ya está en la receta, edita su cantidad')
      return
    }
    const ing = catalogoIngredientes.find(i => i.id === ingredienteNuevoId)
    setIngredientesProducto(prev => [
      ...prev,
      { id_ingrediente: ingredienteNuevoId, nombre: ing.nombre, unidad: ing.unidad, cantidad: cantidadNueva },
    ])
    setCantidadNueva('')
  }

  const handleGuardar = async () => {
    const precioNum = parseFloat(precio.replace(',', '.'))
    if (!nombre || isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Datos inválidos', 'Revisa nombre y precio')
      return
    }

    const ingredientesPayload = []
    for (const i of ingredientesProducto) {
      const cantidadNum = parseFloat(String(i.cantidad).replace(',', '.'))
      if (isNaN(cantidadNum) || cantidadNum <= 0) {
        Alert.alert('Cantidad inválida', `Revisa la cantidad de "${i.nombre}"`)
        return
      }
      ingredientesPayload.push({ id_ingrediente: i.id_ingrediente, cantidad: cantidadNum })
    }

    setGuardando(true)
    try {
      await api.patch(`/productos/${id}`, {
        nombre,
        precio: precioNum,
        descripcion,
        disponible,
        ingredientes: ingredientesPayload,
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

  const disponiblesParaAgregar = catalogoIngredientes.filter(
    c => !ingredientesProducto.some(i => i.id_ingrediente === c.id)
  )

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

        <Text style={styles.label}>Ingredientes de la receta</Text>
        {ingredientesProducto.length === 0 && (
          <Text style={styles.aviso}>Esta receta no tiene ingredientes asociados.</Text>
        )}
        {ingredientesProducto.map(ing => (
          <View key={ing.id_ingrediente} style={styles.filaIngrediente}>
            <Text style={styles.nombreIngrediente}>{ing.nombre} ({ing.unidad})</Text>
            <TextInput
              style={styles.inputCantidad}
              value={String(ing.cantidad)}
              onChangeText={(v) => actualizarCantidad(ing.id_ingrediente, v)}
              keyboardType="decimal-pad"
            />
            <Pressable onPress={() => quitarIngrediente(ing.id_ingrediente)}>
              <Text style={styles.botonQuitar}>✕</Text>
            </Pressable>
          </View>
        ))}

        {disponiblesParaAgregar.length > 0 && (
          <View style={styles.agregarBox}>
            <Text style={styles.label}>Agregar ingrediente</Text>
            <View style={styles.opciones}>
              {disponiblesParaAgregar.map(c => (
                <Pressable
                  key={c.id}
                  style={ingredienteNuevoId === c.id ? styles.opcionActiva : styles.opcion}
                  onPress={() => setIngredienteNuevoId(c.id)}
                >
                  <Text style={ingredienteNuevoId === c.id ? styles.opcionTextoActivo : styles.opcionTexto}>
                    {c.nombre}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filaAgregar}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Cantidad"
                value={cantidadNueva}
                onChangeText={setCantidadNueva}
                keyboardType="decimal-pad"
              />
              <Pressable style={styles.botonAgregar} onPress={agregarIngrediente}>
                <Text style={styles.botonAgregarTexto}>+ Agregar</Text>
              </Pressable>
            </View>
          </View>
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
  aviso: { fontSize: 13, color: '#999999', fontStyle: 'italic', marginBottom: 10 },
  filaIngrediente: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', borderRadius: 10, padding: 10, marginBottom: 8 },
  nombreIngrediente: { flex: 1, fontSize: 14, color: '#333333' },
  inputCantidad: { width: 70, borderWidth: 1, borderColor: '#dddddd', borderRadius: 8, padding: 8, fontSize: 14, textAlign: 'center' },
  botonQuitar: { fontSize: 16, color: '#c62828', paddingHorizontal: 6 },
  agregarBox: { backgroundColor: '#F0F3FA', borderRadius: 10, padding: 12, marginTop: 4, marginBottom: 14 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  opcion: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dddddd' },
  opcionActiva: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1F3864' },
  opcionTexto: { fontSize: 13, color: '#555555' },
  opcionTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  filaAgregar: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  botonAgregar: { backgroundColor: '#1F3864', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 14 },
  botonAgregarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  switchTexto: { fontSize: 15, color: '#333333' },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonEliminar: { backgroundColor: '#ffffff', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c62828', marginBottom: 12 },
  botonEliminarTexto: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
})