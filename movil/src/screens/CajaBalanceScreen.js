import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CajaBalanceScreen() {
  const { auth } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [ventasDiarias, setVentasDiarias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [res, diarias] = await Promise.all([
        api.get('/stats/resumen-mes', auth?.token),
        api.get('/stats/ventas-diarias?dias=7', auth?.token),
      ])
      setResumen(res)
      setVentasDiarias(diarias)
    } catch (e) {
      setError(e.message || 'No se pudo cargar el balance')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [auth?.token])

  useFocusEffect(useCallback(() => { cargar() }, [cargar]))

  const onRefresh = () => {
    setRefrescando(true)
    cargar()
  }

  const maxVenta = Math.max(1, ...ventasDiarias.map(d => d.total))

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Balance</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#314A7E" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>
        Balance del mes {resumen?.fecha_inicio ? `(${resumen.fecha_inicio} - ${resumen.fecha_fin})` : ''}
      </Text>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.kpis}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Ventas</Text>
            <Text style={styles.kpiValor}>${(resumen?.total_ventas ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Gastos</Text>
            <Text style={styles.kpiValor}>${(resumen?.gastos_totales ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Ganancia neta</Text>
            <Text style={styles.kpiValor}>${(resumen?.ganancia_neta ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Pedidos</Text>
            <Text style={styles.kpiValor}>{resumen?.total_pedidos ?? 0}</Text>
          </View>
        </View>

        <View style={styles.ticketPromedio}>
          <Text style={styles.ticketPromedioLabel}>Ticket promedio</Text>
          <Text style={styles.ticketPromedioValor}>${(resumen?.ticket_promedio ?? 0).toFixed(2)}</Text>
        </View>

        <Text style={styles.subtitulo}>Ventas · últimos 7 días</Text>
        <View style={styles.grafica}>
          {ventasDiarias.map((d, i) => (
            <View key={i} style={styles.barraContenedor}>
              <View style={[styles.barra, { height: Math.max(4, (d.total / maxVenta) * 100) }]} />
              <Text style={styles.barraValor}>${d.total.toFixed(0)}</Text>
              <Text style={styles.barraFecha}>{d.fecha}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1B2A41', padding: 20, paddingBottom: 12 },
  content: { padding: 16, gap: 16 },
  error: { color: '#c62828', textAlign: 'center' },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '47%', backgroundColor: '#F3F6FA', padding: 15, borderRadius: 12, alignItems: 'center' },
  kpiLabel: { fontSize: 14, color: '#555555' },
  kpiValor: { fontSize: 20, fontWeight: 'bold', color: '#1B2A41', marginTop: 4 },
  ticketPromedio: { backgroundColor: '#e3f2fd', borderRadius: 12, padding: 15, alignItems: 'center' },
  ticketPromedioLabel: { fontSize: 14, color: '#1565c0' },
  ticketPromedioValor: { fontSize: 22, fontWeight: 'bold', color: '#1565c0', marginTop: 4 },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#555555', marginTop: 8 },
  grafica: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#F3F6FA', borderRadius: 12, padding: 16, height: 160 },
  barraContenedor: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  barra: { width: 18, backgroundColor: '#314A7E', borderRadius: 4, marginBottom: 4 },
  barraValor: { fontSize: 9, color: '#555555' },
  barraFecha: { fontSize: 9, color: '#888888', marginTop: 2 },
})