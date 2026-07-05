import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Button } from 'react-native'
import MeseroNavbar from '../components/MeseroNavbar'
import TablaDetalle from '../components/TablaDetalle'
import BotonPrimario from '../components/BotonPrimario'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'producto', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
  { label: 'Status', key: 'estatus', flex: 1 },
]

const ITEMS = [
  { cantidad: 2, producto: 'Café', precio: '$70', estatus: 'Pendiente' },
  { cantidad: 1, producto: 'Sandwich', precio: '$85', estatus: 'Pendiente' },
]

export default function MeseroPedidoResumenScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Resumen · Mesa 02</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <TablaDetalle columnas={COLUMNAS} datos={ITEMS} />
        <TextInput
          style={styles.observaciones}
          placeholder="Observaciones..."
          multiline
        />
        <Text style={styles.total}>Total    $155.00</Text>
        <View style={styles.botones}>
          <BotonPrimario titulo="Cancelar" color="#dddddd" />
          <BotonPrimario titulo="Enviar a caja" />
        </View>
      </ScrollView>
      <MeseroNavbar activo="pedidos" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { padding: 16, gap: 16 },
  observaciones: {
    borderWidth: 1, borderColor: '#dddddd',
    borderRadius: 10, padding: 12, fontSize: 14, minHeight: 60,
  },
  total: { fontSize: 20, fontWeight: 'bold', color: '#1F3864', textAlign: 'right' },
  botones: { flexDirection: 'row', gap: 8 },
})