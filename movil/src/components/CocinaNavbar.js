import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function CocinaNavbar({ activo, setScreen }) {
  return (
    <View style={styles.navbar}>
      <Pressable style={styles.navItem} onPress={() => setScreen('cocinaPedidos')}>
        <Text style={styles.navIcon}>🍳</Text>
        <Text style={[styles.navLabel, activo === 'cola' && styles.navActivo]}>Cola</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => setScreen('cocinaInventario')}>
        <Text style={styles.navIcon}>📦</Text>
        <Text style={[styles.navLabel, activo === 'inventario' && styles.navActivo]}>Inventario</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => setScreen('cocinaMenu')}>
        <Text style={styles.navIcon}>☰</Text>
        <Text style={[styles.navLabel, activo === 'menu' && styles.navActivo]}>Menú</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#DDE5EE',
    paddingVertical: 8,
    height: 70,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    color: '#aaaaaa',
  },
  navActivo: {
    color: '#314A7E',
    fontWeight: 'bold',
  },
})