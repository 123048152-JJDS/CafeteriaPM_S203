import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Button } from 'react-native'
import CajaNavbar from '../components/CajaNavbar'

export default function CajaTicketScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Ticket #039</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.negocio}>CafeteriaPM</Text>
        <Text style={styles.mesa}>Mesa 01</Text>
        <View style={styles.linea} />
        <View style={styles.fila}>
          <Text style={styles.filaTexto}>2x Café Americano</Text>
          <Text style={styles.filaTexto}>$70</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaTexto}>1x Sandwich Club</Text>
          <Text style={styles.filaTexto}>$85</Text>
        </View>
        <View style={styles.linea} />
        <Text style={styles.total}>Total $155.00</Text>
        <Pressable style={styles.botonBlanco}>
          <Text style={styles.botonBlancoTexto}>Imprimir</Text>
        </Pressable>
        <Pressable style={styles.botonBlanco}>
          <Text style={styles.botonBlancoTexto}>Compartir</Text>
        </Pressable>
        <Pressable style={styles.botonAzul}>
          <Text style={styles.botonTexto}>Ir a Pedidos</Text>
        </Pressable>
      </ScrollView>
      <CajaNavbar activo="pedidos" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 12, alignItems: 'center' },
  negocio: { fontSize: 24, fontWeight: 'bold', color: '#1B2A41' },
  mesa: { fontSize: 18, color: '#555555' },
  linea: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#DDE5EE' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  filaTexto: { fontSize: 16, color: '#333333' },
  total: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  botonBlanco: {
    width: '100%', backgroundColor: '#ffffff', padding: 15,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDE5EE',
  },
  botonAzul: { width: '100%', backgroundColor: '#314A7E', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 16 },
  botonBlancoTexto: { color: '#314A7E', fontSize: 16 },
})