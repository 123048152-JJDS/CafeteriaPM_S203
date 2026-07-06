import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Button } from 'react-native'
import CocinaNavbar from '../components/CocinaNavbar'

export default function CocinaRegistrarCompraScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Registrar Compra</Text>

        {['Producto', 'Cantidad', 'Unidad', 'Proveedor', 'Costo'].map((label, i) => (
          <View key={i}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={label}
              keyboardType={['Cantidad', 'Costo'].includes(label) ? 'numeric' : 'default'}
            />
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
  label: { marginBottom: 6, color: '#666666', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  boton: { backgroundColor: '#1F3864', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
})