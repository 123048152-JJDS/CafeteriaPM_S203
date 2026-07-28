import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MeseroEditarPedidoScreen({ onListo }) {
  const { pedidoId } = useLocalSearchParams()
  const { auth } = useAuth()

  const [pedido, setPedido] = useState(null)
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [actualizando, setActualizando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [ped, prods] = await Promise.all([
        api.get(`/pedidos/${pedidoId}`, auth?.token),
        api.get('/productos/?disponible=true', auth?.token),
      ])
      setPedido(ped)
      setProductos(prods)
    } catch (e) {
      setError(e.message || 'No se pudo cargar el pedido')
    } finally {
      setCargando(false)
    }
  }, [pedidoId, auth?.token])

  useEffect(() => { cargar() }, [cargar])

  const actualizarCantidad = async (detalleId, nuevaCantidad) => {
    setActualizando(true)
    try {
      const actualizado = await api.patch(
        `/pedidos/${pedidoId}/detalles/${detalleId}`,
        { cantidad: nuevaCantidad },
        auth?.token
      )
      setPedido(actualizado)
    } catch (e) {
      Alert.alert('No se pudo actualizar', e.message)
    } finally {
      setActualizando(false)
    }
  }

  const eliminarDetalle = async (detalleId) => {
    setActualizando(true)
    try {
      const actualizado = await api.del(`/pedidos/${pedidoId}/detalles/${detalleId}`, auth?.token)
      setPedido(actualizado)
    } catch (e) {
      Alert.alert('No se pudo eliminar', e.message)
    } finally {
      setActualizando(false)
    }
  }

  const agregarProducto = async (producto) => {
    setActualizando(true)
    try {
      const actualizado = await api.post(
        `/pedidos/${pedidoId}/detalles`,
        { id_producto: producto.id, cantidad: 1 },
        auth?.token
      )
      setPedido(actualizado)
    } catch (e) {
      Alert.alert('No se pudo agregar', e.message)
    } finally {
      setActualizando(false)
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  if (error || !pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error || 'Pedido no encontrado'}</Text>
      </SafeAreaView>
    )
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Editar pedido #{pedido.id}</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitulo}>Productos en el ticket</Text>
        {pedido.detalles.map(d => (
          <View key={d.id} style={styles.fila}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{d.producto?.nombre || `Producto #${d.id_producto}`}</Text>
              <Text style={styles.precio}>${Number(d.precio_unitario).toFixed(2)} c/u</Text>
            </View>
            <View style={styles.contador}>
              <Pressable
                style={styles.contadorBoton}
                disabled={actualizando}
                onPress={() => (d.cantidad > 1 ? actualizarCantidad(d.id, d.cantidad - 1) : eliminarDetalle(d.id))}
              >
                <Text style={styles.contadorTexto}>-</Text>
              </Pressable>
              <Text style={styles.cantidad}>{d.cantidad}</Text>
              <Pressable
                style={styles.contadorBoton}
                disabled={actualizando}
                onPress={() => actualizarCantidad(d.id, d.cantidad + 1)}
              >
                <Text style={styles.contadorTexto}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.total}>Total: ${Number(pedido.total || 0).toFixed(2)}</Text>

        <Text style={[styles.subtitulo, { marginTop: 20 }]}>Agregar producto</Text>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {productosFiltrados.map(p => (
          <Pressable key={p.id} style={styles.cardAgregar} onPress={() => agregarProducto(p)} disabled={actualizando}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{p.nombre}</Text>
              <Text style={styles.precio}>${Number(p.precio).toFixed(2)}</Text>
            </View>
            <Text style={styles.masTexto}>+</Text>
          </Pressable>
        ))}

        <Pressable style={styles.botonListo} onPress={onListo}>
          <Text style={styles.botonListoTexto}>Listo</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', padding: 20, paddingBottom: 8 },
  content: { padding: 16, gap: 10 },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#555555' },
  error: { color: '#c62828', textAlign: 'center', marginTop: 40, paddingHorizontal: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FC', borderRadius: 12, padding: 14 },
  nombre: { fontSize: 15, fontWeight: 'bold', color: '#1F3864' },
  precio: { fontSize: 12, color: '#777777', marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contadorBoton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1F3864', alignItems: 'center', justifyContent: 'center' },
  contadorTexto: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  cantidad: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', minWidth: 20, textAlign: 'center' },
  total: { fontSize: 18, fontWeight: 'bold', color: '#1F3864', textAlign: 'right', marginTop: 8 },
  buscador: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 4 },
  cardAgregar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eeeeee', borderRadius: 10, padding: 12 },
  masTexto: { fontSize: 20, fontWeight: 'bold', color: '#1F3864' },
  botonListo: { backgroundColor: '#1F3864', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  botonListoTexto: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
})