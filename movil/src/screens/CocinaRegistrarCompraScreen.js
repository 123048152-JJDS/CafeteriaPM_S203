import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function CocinaRegistrarCompraScreen({ onGuardar }) {
  const { auth } = useAuth()
  const [ingredientes, setIngredientes] = useState([])
  const [ingredienteId, setIngredienteId] = useState(null)
  const [cantidad, setCantidad] = useState('')
  const [costoTotal, setCostoTotal] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.get('/productos/ingredientes', auth?.token)
        setIngredientes(data)
        if (data.length > 0) setIngredienteId(data[0].id)
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los ingredientes')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [auth?.token])

  const handleGuardar = async () => {
    if (!ingredienteId || !cantidad || !costoTotal) {
      Alert.alert('Faltan datos', 'Selecciona un ingrediente y llena cantidad y costo')
      return
    }
    const cantidadNum = parseFloat(cantidad.replace(',', '.'))
    const costoNum = parseFloat(costoTotal.replace(',', '.'))
    if (isNaN(cantidadNum) || cantidadNum <= 0 || isNaN(costoNum) || costoNum < 0) {
      Alert.alert('Datos inválidos', 'Verifica cantidad y costo')
      return
    }

    setGuardando(true)
    try {
      await api.post('/compras/', {
        id_ingrediente: ingredienteId,
        cantidad: cantidadNum,
        costo_total: costoNum,
        fecha,
      }, auth?.token)
      onGuardar()
    } catch (e) {
      Alert.alert('No se pudo registrar la compra', e.message)
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
        <Text style={styles.titulo}>Registrar Compra</Text>

        <Text style={styles.label}>Ingrediente</Text>
        <View style={styles.opciones}>
          {ingredientes.map(ing => (
            <Pressable
              key={ing.id}
              style={ingredienteId === ing.id ? styles.opcionActiva : styles.opcion}
              onPress={() => setIngredienteId(ing.id)}
            >
              <Text style={ingredienteId === ing.id ? styles.opcionTextoActivo : styles.opcionTexto}>
                {ing.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Cantidad</Text>
        <TextInput style={styles.input} value={cantidad} onChangeText={setCantidad} keyboardType="decimal-pad" placeholder="0.0" />

        <Text style={styles.label}>Costo total ($)</Text>
        <TextInput style={styles.input} value={costoTotal} onChangeText={setCostoTotal} keyboardType="decimal-pad" placeholder="0.00" />

        <Text style={styles.label}>Fecha</Text>
        <TextInput style={styles.input} value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />

        <Pressable style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Registrar compra</Text>}
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
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  opcion: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#dddddd' },
  opcionActiva: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1F3864' },
  opcionTexto: { fontSize: 13, color: '#555555' },
  opcionTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})