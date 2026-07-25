import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native'
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
  const { mesaId, estado } = useLocalSearchParams()
  const esReserva = estado === 'reservada'

  const confirmarLiberar = () => {
    Alert.alert(
      esReserva ? 'Cancelar reserva' : 'Liberar mesa',
      esReserva
        ? '¿Seguro que quieres cancelar esta reserva?'
        : '¿Seguro que quieres cerrar y liberar esta mesa? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, confirmar', style: 'destructive', onPress: onLiberar },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mesa {mesaId ?? '--'}</Text>
        <Text style={styles.estado}>{esReserva ? 'Reservada' : 'Ocupada'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {esReserva ? (
          <View style={styles.alerta}>
            <Text style={styles.alertaTexto}>📅 Mesa reservada, aún sin pedido</Text>
          </View>
        ) : (
          <>
            <View style={styles.alerta}>
              <Text style={styles.alertaTexto}>⚠️ Pedido en curso</Text>
            </View>
            <TablaDetalle columnas={COLUMNAS} datos={ITEMS} />
          </>
        )}
        <Text style={styles.observaciones}>Observaciones: Sin cebolla</Text>
        <View style={styles.botones}>
          {!esReserva && (
            <BotonPrimario titulo="Agregar pedido" onPress={() => onAgregarPedido(mesaId)} />
          )}
          <BotonPrimario
            titulo={esReserva ? 'Cancelar reserva' : 'Liberar'}
            color="#ef5350"
            onPress={confirmarLiberar}
          />
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