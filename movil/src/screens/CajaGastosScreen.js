import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, FlatList } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function CajaGastosScreen() {
  const { auth } = useAuth()
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState(null)
  const [fecha, setFecha] = useState(hoyISO())
  const [guardando, setGuardando] = useState(false)

  const [gastos, setGastos] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)

  const cargarCategorias = useCallback(async () => {
    try {
      const cats = await api.get('/productos/categorias', auth?.token)
      const deGasto = cats.filter(c => c.tipo === 'gasto' || c.tipo === 'ambos')
      setCategorias(deGasto)
      if (deGasto.length > 0) setCategoriaId(prev => prev ?? deGasto[0].id)
    } catch {
      // si falla, el picker queda vacío; el usuario puede reintentar recargando la pantalla
    }
  }, [auth?.token])

  const cargarGastos = useCallback(async () => {
    try {
      const data = await api.get('/gastos/', auth?.token)
      setGastos(data.slice(0, 10))
    } catch {
      // no bloquea el formulario si falla el listado
    } finally {
      setCargandoLista(false)
    }
  }, [auth?.token])

  useEffect(() => { cargarCategorias() }, [cargarCategorias])
  useFocusEffect(useCallback(() => { cargarGastos() }, [cargarGastos]))

  const handleGuardar = async () => {
    if (!descripcion || !monto) {
      Alert.alert('Faltan datos', 'Descripción y monto son obligatorios')
      return
    }
    const montoNum = parseFloat(monto.replace(',', '.'))
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0')
      return
    }

    setGuardando(true)
    try {
      await api.post('/gastos/', {
        descripcion,
        monto: montoNum,
        id_categoria: categoriaId,
        fecha,
      }, auth?.token)
      setDescripcion('')
      setMonto('')
      setFecha(hoyISO())
      cargarGastos()
      Alert.alert('Gasto registrado', 'El gasto se guardó correctamente')
    } catch (e) {
      Alert.alert('No se pudo registrar el gasto', e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Registrar gasto</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Compra de leche" />

        <Text style={styles.label}>Monto ($)</Text>
        <TextInput style={styles.input} value={monto} onChangeText={setMonto} keyboardType="decimal-pad" placeholder="0.00" />

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

        <Text style={styles.label}>Fecha</Text>
        <TextInput style={styles.input} value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />

        <Pressable style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonTexto}>Guardar gasto</Text>}
        </Pressable>

        <Text style={styles.subtitulo}>Últimos gastos</Text>
        {cargandoLista ? (
          <ActivityIndicator color="#314A7E" />
        ) : gastos.length === 0 ? (
          <Text style={styles.vacio}>Sin gastos registrados todavía.</Text>
        ) : (
          gastos.map(g => (
            <View key={g.id} style={styles.filaGasto}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filaDescripcion}>{g.descripcion}</Text>
                <Text style={styles.filaCategoria}>{g.categoria?.nombre || 'Sin categoría'} · {g.fecha}</Text>
              </View>
              <Text style={styles.filaMonto}>-${Number(g.monto).toFixed(2)}</Text>
            </View>
          ))
        )}
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
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoria: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#dddddd' },
  categoriaActiva: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#314A7E' },
  categoriaTexto: { fontSize: 13, color: '#555555' },
  categoriaTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  boton: { backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#555555', marginTop: 24, marginBottom: 8 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 8 },
  filaGasto: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FC', borderRadius: 10, padding: 12, marginBottom: 8 },
  filaDescripcion: { fontSize: 14, fontWeight: 'bold', color: '#1B2A41' },
  filaCategoria: { fontSize: 12, color: '#888888', marginTop: 2 },
  filaMonto: { fontSize: 14, fontWeight: 'bold', color: '#c62828' },
})