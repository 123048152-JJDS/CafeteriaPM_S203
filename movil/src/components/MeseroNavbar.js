import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function MeseroNavbar({ activo }) {
  return (
    <View style={styles.navbar}>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>⊞</Text>
        <Text style={[styles.navLabel, activo === 'mesas' && styles.navActivo]}>Mesas</Text>
      </Pressable>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>📋</Text>
        <Text style={[styles.navLabel, activo === 'pedidos' && styles.navActivo]}>Pedidos</Text>
      </Pressable>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>👤</Text>
        <Text style={[styles.navLabel, activo === 'perfil' && styles.navActivo]}>Perfil</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingVertical: 8,
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
    color: '#1F3864',
    fontWeight: 'bold',
  },
})