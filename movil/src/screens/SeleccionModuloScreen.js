import React from 'react'
import { Text, StyleSheet, Pressable, SafeAreaView } from 'react-native'

const MODULOS = [
  { label: 'Mesero', value: 'mesero', color: '#1F3864' },
  { label: 'Caja', value: 'caja', color: '#314A7E' },
  { label: 'Cocina', value: 'cocina', color: '#1F3864' },
]

export default function SeleccionModuloScreen({ onSeleccionar }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>¿Con qué rol quieres entrar?</Text>
      {MODULOS.map(m => (
        <Pressable
          key={m.value}
          style={[styles.boton, { backgroundColor: m.color }]}
          onPress={() => onSeleccionar(m.value)}
        >
          <Text style={styles.botonTexto}>{m.label}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F3864',
    textAlign: 'center',
    marginBottom: 24,
  },
  boton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})