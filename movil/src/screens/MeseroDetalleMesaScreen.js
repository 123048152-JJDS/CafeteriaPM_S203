import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import TablaDetalle from '../components/TablaDetalle'
import BotonPrimario from '../components/BotonPrimario'

const COLUMNAS = [
  { label: 'Cant', key: 'cantidad', flex: 0.5 },
  { label: 'Producto', key: 'producto', flex: 2 },
  { label: 'Precio', key: 'precio', flex: 1 },
  { label: 'Estado', key: 'estatus', flex: 1 },
]

const ITEMS = [
  { cantidad: 2, producto: 'Café Americano', precio: '$70', estatus: 'Entregado' },
  { cantidad: 1, producto: 'Sandwich Club', precio: '$85', estatus: 'Preparando' },
]

export default function MeseroDetalleMesaScreen({ onAgregarPedido, onLiberar }) {
  const { mesaId } = useLocalSearchParams()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mesa {mesaId ?? '--'}</Text>
        <Text style={styles.estado}>Ocupada</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alerta}>
          <Text style={styles.alertaTexto}>⚠️ Pedido en curso</Text>
        </View>
        <TablaDetalle columnas={COLUMNAS} datos={ITEMS} />
        <Text style={styles.observaciones}>Observaciones: Sin cebolla</Text>
        <View style={styles.botones}>
          <BotonPrimario titulo="Agregar pedido" onPress={onAgregarPedido} />
          <BotonPrimario titulo="Liberar" color="#ef5350" onPress={onLiberar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1F3864' },
  estado: { fontSize: 13, color: '#ef5350' },
  content: { padding: 16, gap: 16 },
  alerta: { backgroundColor: '#fff8e1', borderRadius: 8, padding: 10, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  alertaTexto: { color: '#f57f17', fontWeight: 'bold' },
  observaciones: { fontSize: 13, color: '#888888', fontStyle: 'italic' },
  botones: { gap: 8 },
})