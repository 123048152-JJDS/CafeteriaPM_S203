import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Button } from 'react-native'
import MeseroNavbar from '../components/MeseroNavbar'
import TablaDetalle from '../components/TablaDetalle'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'producto', flex: 2 },
  { label: 'Estado', key: 'estatus', flex: 1 },
]

const ITEMS = [
  { cantidad: 2, producto: 'Café', estatus: '✓' },
  { cantidad: 1, producto: 'Sandwich', estatus: '⏳' },
]

const ESTADOS = ['Enviado', 'Preparando', 'Listo']

export default function MeseroPedidoEstadoScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Estado pedido</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTexto}>Mesa 02</Text>
          <Text style={styles.infoTexto}>Pedido #043</Text>
        </View>
        <View style={styles.indicador}>
          {ESTADOS.map((e, i) => (
            <View key={i} style={styles.indicadorItem}>
              <View style={[styles.circulo, i === 1 && styles.circuloActivo]}>
                <Text style={styles.circuloTexto}>{i + 1}</Text>
              </View>
              <Text style={styles.indicadorLabel}>{e}</Text>
            </View>
          ))}
        </View>
        <TablaDetalle columnas={COLUMNAS} datos={ITEMS} />
      </ScrollView>
      <MeseroNavbar activo="pedidos" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { padding: 16, gap: 16 },
  infoBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14,
  },
  infoTexto: { fontSize: 15, fontWeight: 'bold', color: '#1F3864' },
  indicador: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  indicadorItem: { alignItems: 'center', gap: 6 },
  circulo: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#dddddd', alignItems: 'center', justifyContent: 'center',
  },
  circuloActivo: { backgroundColor: '#1F3864' },
  circuloTexto: { color: '#ffffff', fontWeight: 'bold' },
  indicadorLabel: { fontSize: 11, color: '#888888' },
})