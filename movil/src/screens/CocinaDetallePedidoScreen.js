import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Button } from 'react-native'
import CocinaNavbar from '../components/CocinaNavbar'

export default function CocinaDetallePedidoScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Detalle del Pedido</Text>

        <View style={styles.card}>
          <Text style={styles.mesa}>Mesa 03</Text>
          <Text style={styles.numero}>Pedido #041</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.filaTexto}>Café Americano</Text>
          <Text style={styles.filaTexto}>x2</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaTexto}>Sandwich</Text>
          <Text style={styles.filaTexto}>x1</Text>
        </View>

        <Text style={styles.subtitulo}>Notas</Text>
        <View style={styles.notas}>
          <Text>Sin azúcar y pan integral.</Text>
        </View>

        <Pressable style={styles.botonPreparacion}>
          <Text style={styles.botonTexto}>En preparación</Text>
        </Pressable>
        <Pressable style={styles.botonListo}>
          <Text style={styles.botonTexto}>Marcar como listo</Text>
        </Pressable>

        <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
      </ScrollView>

      <CocinaNavbar activo="cola" setScreen={setScreen} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 20 },
  card: { backgroundColor: '#FFF8E8', padding: 16, borderRadius: 12, marginBottom: 20 },
  mesa: { fontSize: 20, fontWeight: 'bold' },
  numero: { marginTop: 4, color: '#555555' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  filaTexto: { fontSize: 15, color: '#333333' },
  subtitulo: { marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 16 },
  notas: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 10, marginBottom: 20 },
  botonPreparacion: { backgroundColor: '#FF9800', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  botonListo: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})