import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'

export default function BotonPrimario({ titulo, color, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: disabled ? '#c5c5c5' : (color || '#1F3864'),
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={onPress}
      disabled={disabled}
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