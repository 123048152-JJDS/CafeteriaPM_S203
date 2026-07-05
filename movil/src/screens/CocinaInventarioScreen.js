import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Button } from 'react-native'
import CocinaNavbar from '../components/CocinaNavbar'

const inventario = [
  { producto: 'Leche', unidad: 'L', stock: '0.8' },
  { producto: 'Harina', unidad: 'kg', stock: '0.3' },
  { producto: 'Café', unidad: 'kg', stock: '2.4' },
]

export default function CocinaInventarioScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Inventario</Text>

        <View style={styles.alerta}>
          <Text style={styles.alertaTexto}>⚠ Stock crítico</Text>
          <Text style={styles.alertaTexto}>Leche, Harina</Text>
        </View>

        <View style={styles.encabezado}>
          <Text style={styles.enc}>Producto</Text>
          <Text style={styles.enc}>Unidad</Text>
          <Text style={styles.enc}>Stock</Text>
        </View>

        {inventario.map((item, index) => (
          <View key={index} style={styles.fila}>
            <Text style={styles.txt}>{item.producto}</Text>
            <Text style={styles.txt}>{item.unidad}</Text>
            <Text style={[styles.txt, Number(item.stock) < 1 && styles.rojo]}>{item.stock}</Text>
          </View>
        ))}

        <Pressable style={styles.boton}>
          <Text style={styles.botonTexto}>Registrar compra</Text>
        </Pressable>

        <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
      </ScrollView>

      <CocinaNavbar activo="inventario" setScreen={setScreen} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 20, paddingBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', marginBottom: 20 },
  alerta: { backgroundColor: '#FDECEC', padding: 14, borderRadius: 10, marginBottom: 20 },
  alertaTexto: { color: '#C62828', fontWeight: 'bold' },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  enc: { width: '33%', fontWeight: 'bold', color: '#333333' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  txt: { width: '33%', fontSize: 14, color: '#333333' },
  rojo: { color: '#E53935', fontWeight: 'bold' },
  boton: { backgroundColor: '#1F3864', marginTop: 24, marginBottom: 12, padding: 14, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})