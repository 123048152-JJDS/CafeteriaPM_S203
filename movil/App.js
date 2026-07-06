import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, Button, SafeAreaView, ScrollView } from 'react-native'
import React, { useState } from 'react'

// Mesero
import WelcomeScreen from './src/screens/WelcomeScreen'
import LoginScreen from './src/screens/LoginScreen'
import MeseroMesasScreen from './src/screens/MeseroMesasScreen'
import MeseroDetalleMesaScreen from './src/screens/MeseroDetalleMesaScreen'
import MeseroPedidoCatalogoScreen from './src/screens/MeseroPedidoCatalogoScreen'
import MeseroPedidoResumenScreen from './src/screens/MeseroPedidoResumenScreen'
import MeseroPedidoEstadoScreen from './src/screens/MeseroPedidoEstadoScreen'
import MeseroPerfilScreen from './src/screens/MeseroPerfilScreen'

// Caja
import CajaPedidosActivosScreen from './src/screens/CajaPedidosActivosScreen'
import CajaConfirmarPedidoScreen from './src/screens/CajaConfirmarPedidoScreen'
import CajaPagosScreen from './src/screens/CajaPagosScreen'
import CajaTicketScreen from './src/screens/CajaTicketScreen'
import CajaBalanceScreen from './src/screens/CajaBalanceScreen'
import CajaGastosScreen from './src/screens/CajaGastosScreen'

// Cocina
import CocinaPedidosScreen from './src/screens/CocinaPedidosScreen'
import CocinaDetallePedidoScreen from './src/screens/CocinaDetallePedidoScreen'
import CocinaInventarioScreen from './src/screens/CocinaInventarioScreen'
import CocinaRegistrarCompraScreen from './src/screens/CocinaRegistrarCompraScreen'
import CocinaMenuScreen from './src/screens/CocinaMenuScreen'
import CocinaNuevoProductoScreen from './src/screens/CocinaNuevoProductoScreen'

export default function App() {
  const [screen, setScreen] = useState('menu')

  switch (screen) {

    // Mesero
    case 'welcome':       return <WelcomeScreen setScreen={setScreen} />
    case 'login':         return <LoginScreen setScreen={setScreen} />
    case 'mesas':         return <MeseroMesasScreen setScreen={setScreen} />
    case 'detalleMesa':   return <MeseroDetalleMesaScreen setScreen={setScreen} />
    case 'pedidoCatalogo':return <MeseroPedidoCatalogoScreen setScreen={setScreen} />
    case 'pedidoResumen': return <MeseroPedidoResumenScreen setScreen={setScreen} />
    case 'pedidoEstado':  return <MeseroPedidoEstadoScreen setScreen={setScreen} />
    case 'perfil':        return <MeseroPerfilScreen setScreen={setScreen} />

    // Caja
    case 'cajaPedidos':   return <CajaPedidosActivosScreen setScreen={setScreen} />
    case 'cajaConfirmar': return <CajaConfirmarPedidoScreen setScreen={setScreen} />
    case 'cajaPagos':     return <CajaPagosScreen setScreen={setScreen} />
    case 'cajaTicket':    return <CajaTicketScreen setScreen={setScreen} />
    case 'cajaBalance':   return <CajaBalanceScreen setScreen={setScreen} />
    case 'cajaGastos':    return <CajaGastosScreen setScreen={setScreen} />

    // Cocina
    case 'cocinaPedidos':   return <CocinaPedidosScreen setScreen={setScreen} />
    case 'cocinaDetalle':   return <CocinaDetallePedidoScreen setScreen={setScreen} />
    case 'cocinaInventario':return <CocinaInventarioScreen setScreen={setScreen} />
    case 'cocinaRegistrar': return <CocinaRegistrarCompraScreen setScreen={setScreen} />
    case 'cocinaMenu':      return <CocinaMenuScreen setScreen={setScreen} />
    case 'cocinaNuevo':     return <CocinaNuevoProductoScreen setScreen={setScreen} />

    case 'menu':
    default:
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>

            <Text style={styles.appTitulo}>CafeteriaPM</Text>

            <Text style={styles.moduloTitulo}>── Módulo Mesero ──</Text>
            <Button onPress={() => setScreen('welcome')} title="Welcome" />
            <Button onPress={() => setScreen('login')} title="Login" />
            <Button onPress={() => setScreen('mesas')} title="Mesas" />
            <Button onPress={() => setScreen('detalleMesa')} title="Detalle de Mesa" />
            <Button onPress={() => setScreen('pedidoCatalogo')} title="Pedido — Catálogo" />
            <Button onPress={() => setScreen('pedidoResumen')} title="Pedido — Resumen" />
            <Button onPress={() => setScreen('pedidoEstado')} title="Pedido — Estado" />
            <Button onPress={() => setScreen('perfil')} title="Perfil" />

            <Text style={styles.moduloTitulo}>── Módulo Caja ──</Text>
            <Button onPress={() => setScreen('cajaPedidos')} title="Pedidos Activos" />
            <Button onPress={() => setScreen('cajaConfirmar')} title="Confirmar Pedido" />
            <Button onPress={() => setScreen('cajaPagos')} title="Pagos" />
            <Button onPress={() => setScreen('cajaTicket')} title="Ticket" />
            <Button onPress={() => setScreen('cajaBalance')} title="Balance" />
            <Button onPress={() => setScreen('cajaGastos')} title="Gastos" />

            <Text style={styles.moduloTitulo}>── Módulo Cocina ──</Text>
            <Button onPress={() => setScreen('cocinaPedidos')} title="Cola de Pedidos" />
            <Button onPress={() => setScreen('cocinaDetalle')} title="Detalle de Pedido" />
            <Button onPress={() => setScreen('cocinaInventario')} title="Inventario" />
            <Button onPress={() => setScreen('cocinaRegistrar')} title="Registrar Compra" />
            <Button onPress={() => setScreen('cocinaMenu')} title="Menú" />
            <Button onPress={() => setScreen('cocinaNuevo')} title="Nuevo Producto" />

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
  appTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F3864',
    textAlign: 'center',
    marginBottom: 8,
  },
  moduloTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
})