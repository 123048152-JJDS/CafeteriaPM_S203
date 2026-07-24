import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native'
import BotonPrimario from '../components/BotonPrimario'

export default function WelcomeScreen({ onIniciarSesion }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logoCafe.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>CafeteriaPM</Text>
        <Text style={styles.subtitle}>Gestión inteligente para tu negocio</Text>
        <BotonPrimario titulo="Iniciar sesión" onPress={onIniciarSesion} />
      </View>
      <Text style={styles.footerText}>Welcome / Info app</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F3864',
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
  },
  footerText: {
    color: '#aaaaaa',
    fontSize: 11,
  },
})