import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button, SafeAreaView, ScrollView } from 'react-native'
import React, { useState } from 'react'

// Caja
import CajaPedidosActivosScreen from './src/screens/CajaPedidosActivosScreen'
import CajaConfirmarPedidoScreen from './src/screens/CajaConfirmarPedidoScreen'
import CajaPagosScreen from './src/screens/CajaPagosScreen'
import CajaTicketScreen from './src/screens/CajaTicketScreen'
import CajaBalanceScreen from './src/screens/CajaBalanceScreen'
import CajaGastosScreen from './src/screens/CajaGastosScreen'

export default function App() {
  const [screen, setScreen] = useState('menu')

  switch (screen) {
    case 'cajaPedidos': return <CajaPedidosActivosScreen setScreen={setScreen} />
    case 'cajaConfirmar': return <CajaConfirmarPedidoScreen setScreen={setScreen} />
    case 'cajaPagos': return <CajaPagosScreen setScreen={setScreen} />
    case 'cajaTicket': return <CajaTicketScreen setScreen={setScreen} />
    case 'cajaBalance': return <CajaBalanceScreen setScreen={setScreen} />
    case 'cajaGastos': return <CajaGastosScreen setScreen={setScreen} />

    case 'menu':
    default:
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.titulo}>Módulo Caja</Text>
            <Button onPress={() => setScreen('cajaPedidos')} title="Pedidos Activos" />
            <Button onPress={() => setScreen('cajaConfirmar')} title="Confirmar Pedido" />
            <Button onPress={() => setScreen('cajaPagos')} title="Pagos" />
            <Button onPress={() => setScreen('cajaTicket')} title="Ticket" />
            <Button onPress={() => setScreen('cajaBalance')} title="Balance" />
            <Button onPress={() => setScreen('cajaGastos')} title="Gastos" />
            <StatusBar style="auto" />
          </ScrollView>
        </SafeAreaView>
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 24,
    gap: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F3864',
    textAlign: 'center',
    marginBottom: 16,
  },
})