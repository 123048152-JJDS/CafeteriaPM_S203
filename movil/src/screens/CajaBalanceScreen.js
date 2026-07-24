import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native'

const KPIS = [
  { label: 'Ventas', valor: '$3,420' },
  { label: 'Gastos', valor: '$840' },
  { label: 'Ganancia', valor: '$2,580' },
  { label: 'Pedidos', valor: '18' },
]

export default function CajaBalanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Balance 26 May</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpis}>
          {KPIS.map((k, i) => (
            <View key={i} style={styles.kpi}>
              <Text style={styles.kpiLabel}>{k.label}</Text>
              <Text style={styles.kpiValor}>{k.valor}</Text>
            </View>
          ))}
        </View>
        <View style={styles.grafica}>
          <Text style={styles.graficaTexto}>📊 Gráfica ventas por hora</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { padding: 16, gap: 16 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '47%', backgroundColor: '#F3F6FA', padding: 15, borderRadius: 12, alignItems: 'center' },
  kpiLabel: { fontSize: 14, color: '#555555' },
  kpiValor: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41' },
  grafica: { backgroundColor: '#F3F6FA', padding: 20, borderRadius: 12, alignItems: 'center' },
  graficaTexto: { fontSize: 16, color: '#555555' },
})