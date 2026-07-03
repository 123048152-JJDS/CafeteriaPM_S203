import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
} from 'react-native'

const MESAS = [
  { id: '1', numero: '01', capacidad: 4, estado: 'libre' },
  { id: '2', numero: '02', capacidad: 4, estado: 'ocupada' },
  { id: '3', numero: '03', capacidad: 4, estado: 'libre' },
  { id: '4', numero: '04', capacidad: 6, estado: 'reservada' },
  { id: '5', numero: '05', capacidad: 2, estado: 'libre' },
  { id: '6', numero: '06', capacidad: 4, estado: 'ocupada' },
  { id: '7', numero: '07', capacidad: 2, estado: 'libre' },
  { id: '8', numero: '08', capacidad: 2, estado: 'libre' },
  { id: '9', numero: '09', capacidad: 6, estado: 'ocupada' },
]

const ESTADO_COLORES = {
  libre:    { bg: '#e8f5e9', border: '#4caf50', texto: '#2e7d32' },
  ocupada:  { bg: '#ffebee', border: '#ef5350', texto: '#c62828' },
  reservada:{ bg: '#fff8e1', border: '#ffc107', texto: '#f57f17' },
}

export default function MeseroMesasScreen({ navigation }) {
  const renderMesa = ({ item }) => {
    const color = ESTADO_COLORES[item.estado]
    return (
      <View style={[styles.card, { backgroundColor: color.bg, borderColor: color.border }]}>
        <Text style={[styles.cardNumero, { color: color.texto }]}>{item.numero}</Text>
        <Text style={styles.cardCapacidad}>{item.capacidad} p.</Text>
        <Pressable
          style={[styles.cardBoton, { backgroundColor: color.border }]}
          onPress={() => navigation.navigate('MeseroDetalleMesa', { mesa: item })}
        >
          <Text style={styles.cardBotonTexto}>Seleccionar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.titulo}>Seleccionar mesa</Text>

      <FlatList
        data={MESAS}
        keyExtractor={item => item.id}
        numColumns={3}
        renderItem={renderMesa}
        contentContainerStyle={styles.grid}
      />

      {/* Barra inferior */}
      <View style={styles.navbar}>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('MeseroMesas')}>
          <Text style={styles.navIconActive}>⊞</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Mesas</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('MeseroPedidoCatalogo')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Pedidos</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('MeseroPerfil')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Perfil</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F3864',
    padding: 20,
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  cardNumero: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardCapacidad: {
    fontSize: 12,
    color: '#888888',
  },
  cardBoton: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  cardBotonTexto: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  navIconActive: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    color: '#aaaaaa',
  },
  navLabelActive: {
    color: '#1F3864',
    fontWeight: 'bold',
  },
})