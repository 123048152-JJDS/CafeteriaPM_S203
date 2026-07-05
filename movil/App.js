import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button, SafeAreaViewBase } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'

import WelcomeScreen from './src/screens/WelcomeScreen'
import LoginScreen from './src/screens/LoginScreen'
import MeseroMesasScreen from './src/screens/MeseroMesasScreen'
import MeseroDetalleMesaScreen from './src/screens/MeseroDetalleMesaScreen'
import MeseroPedidoCatalogoScreen from './src/screens/MeseroPedidoCatalogoScreen'
import MeseroPedidoResumenScreen from './src/screens/MeseroPedidoResumenScreen'
import MeseroPedidoEstadoScreen from './src/screens/MeseroPedidoEstadoScreen'
import MeseroPerfilScreen from './src/screens/MeseroPerfilScreen'

export default function App() {
  const [screen, setScreen] = useState('menu')

  switch (screen) {
    case 'welcome':
      return <WelcomeScreen setScreen={setScreen} />
    case 'login':
      return <LoginScreen setScreen={setScreen} />
    case 'mesas':
      return <MeseroMesasScreen setScreen={setScreen} />
    case 'detalleMesa':
      return <MeseroDetalleMesaScreen setScreen={setScreen} />
    case 'pedidoCatalogo':
      return <MeseroPedidoCatalogoScreen setScreen={setScreen} />
    case 'pedidoResumen':
      return <MeseroPedidoResumenScreen setScreen={setScreen} />
    case 'pedidoEstado':
      return <MeseroPedidoEstadoScreen setScreen={setScreen} />
    case 'perfil':
      return <MeseroPerfilScreen setScreen={setScreen} />

    case 'menu':
    default:
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.titulo}>Módulo Mesero</Text>
          <Button onPress={() => setScreen('welcome')} title="Welcome" />
          <Button onPress={() => setScreen('login')} title="Login" />
          <Button onPress={() => setScreen('mesas')} title="Mesas" />
          <Button onPress={() => setScreen('detalleMesa')} title="Detalle de Mesa" />
          <Button onPress={() => setScreen('pedidoCatalogo')} title="Pedido — Catálogo" />
          <Button onPress={() => setScreen('pedidoResumen')} title="Pedido — Resumen" />
          <Button onPress={() => setScreen('pedidoEstado')} title="Pedido — Estado" />
          <Button onPress={() => setScreen('perfil')} title="Perfil" />
          <StatusBar style="auto" />
        </SafeAreaView >
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F3864',
  },
})