import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function CajaNavbar({ activo }) {
  return (
    <View style={styles.navbar}>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>📋</Text>
        <Text style={[styles.navLabel, activo === 'pedidos' && styles.navActivo]}>Pedidos</Text>
      </Pressable>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>📊</Text>
        <Text style={[styles.navLabel, activo === 'balance' && styles.navActivo]}>Balance</Text>
      </Pressable>
      <Pressable style={styles.navItem}>
        <Text style={styles.navIcon}>💸</Text>
        <Text style={[styles.navLabel, activo === 'gastos' && styles.navActivo]}>Gastos</Text>
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