import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button, SafeAreaView, ScrollView } from 'react-native'
import React, { useState } from 'react'

import CocinaPedidosScreen from './src/screens/CocinaPedidosScreen'
import CocinaDetallePedidoScreen from './src/screens/CocinaDetallePedidoScreen'
import CocinaInventarioScreen from './src/screens/CocinaInventarioScreen'
import CocinaRegistrarCompraScreen from './src/screens/CocinaRegistrarCompraScreen'
import CocinaMenuScreen from './src/screens/CocinaMenuScreen'
import CocinaNuevoProductoScreen from './src/screens/CocinaNuevoProductoScreen'

export default function App() {
  const [screen, setScreen] = useState('menu')

  switch (screen) {
    case 'cocinaPedidos':      return <CocinaPedidosScreen setScreen={setScreen} />
    case 'cocinaDetalle':      return <CocinaDetallePedidoScreen setScreen={setScreen} />
    case 'cocinaInventario':   return <CocinaInventarioScreen setScreen={setScreen} />
    case 'cocinaRegistrar':    return <CocinaRegistrarCompraScreen setScreen={setScreen} />
    case 'cocinaMenu':         return <CocinaMenuScreen setScreen={setScreen} />
    case 'cocinaNuevo':        return <CocinaNuevoProductoScreen setScreen={setScreen} />
    case 'menu':
    default:
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.titulo}>Módulo Cocina</Text>
            <Button onPress={() => setScreen('cocinaPedidos')}    title="Cola de Pedidos" />
            <Button onPress={() => setScreen('cocinaDetalle')}    title="Detalle de Pedido" />
            <Button onPress={() => setScreen('cocinaInventario')} title="Inventario" />
            <Button onPress={() => setScreen('cocinaRegistrar')}  title="Registrar Compra" />
            <Button onPress={() => setScreen('cocinaMenu')}       title="Menú" />
            <Button onPress={() => setScreen('cocinaNuevo')}      title="Nuevo Producto" />
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