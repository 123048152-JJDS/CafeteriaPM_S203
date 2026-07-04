import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'

export default function BotonPrimario({ titulo, color, onPress }) {
  return (
    <Pressable
      style={[styles.boton, { backgroundColor: color || '#1F3864' }]}
      onPress={onPress}
    >
      <Text style={styles.botonTexto}>{titulo}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  boton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})