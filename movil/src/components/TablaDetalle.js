import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TablaDetalle({ columnas, datos }) {
  return (
    <View style={styles.tabla}>
      <View style={styles.tablaHeader}>
        {columnas.map((col, i) => (
          <Text key={i} style={[styles.col, { flex: col.flex || 1 }]}>{col.label}</Text>
        ))}
      </View>
      {datos.map((fila, i) => (
        <View key={i} style={styles.tablaFila}>
          {columnas.map((col, j) => (
            <Text
              key={j}
              style={[styles.celda, { flex: col.flex || 1 }, fila.color && j === columnas.length - 1 && { color: fila.color }]}
            >
              {fila[col.key]}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  tabla: {
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  col: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#555555',
  },
  tablaFila: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  celda: {
    fontSize: 12,
    color: '#333333',
  },
})