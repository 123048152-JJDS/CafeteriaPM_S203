import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADOS_INFO = {
  pendiente:      { label: 'Pendiente',      color: '#f57f17', bg: '#fff8e1' },
  en_preparacion: { label: 'En preparación', color: '#e65100', bg: '#fff3e0' },
  listo:          { label: 'Listo',          color: '#2e7d32', bg: '#e8f5e9' },
  entregado:      { label: 'Entregado',      color: '#1565c0', bg: '#e3f2fd' },
  pagado:         { label: 'Pagado',         color: '#37474f', bg: '#eceff1' },
  cancelado:      { label: 'Cancelado',      color: '#c62828', bg: '#ffebee' },
}

const GRUPOS = {
  activos:     ['pendiente', 'en_preparacion', 'listo', 'entregado'],
  pendientes:  ['pendiente'],
  finalizados: ['pagado', 'cancelado'],
}

const ESTATUS_DISPONIBLES = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado']

export default function MeseroPedidosScreen({ onVerDetalle }) {
  const { auth } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState(null)
  const [grupoActivo, setGrupoActivo] = useState(null)
  const [estatusActivo, setEstatusActivo] = useState('Todos')

  const cargar = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get('/pedidos/', auth?.token)
      setPedidos(data)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los pedidos')
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

  const conteos = useMemo(() => ({
    activos: pedidos.filter(p => GRUPOS.activos.includes(p.estado_actual?.nombre)).length,
    pendientes: pedidos.filter(p => GRUPOS.pendientes.includes(p.estado_actual?.nombre)).length,
    finalizados: pedidos.filter(p => GRUPOS.finalizados.includes(p.estado_actual?.nombre)).length,
  }), [pedidos])

  const estatusVisibles = useMemo(() => {
    if (!grupoActivo) return ESTATUS_DISPONIBLES
    return ESTATUS_DISPONIBLES.filter(e => GRUPOS[grupoActivo].includes(e))
  }, [grupoActivo])

  useEffect(() => {
    if (estatusActivo !== 'Todos' && !estatusVisibles.includes(estatusActivo)) {
      setEstatusActivo('Todos')
    }
  }, [grupoActivo])

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (grupoActivo) {
      lista = lista.filter(p => GRUPOS[grupoActivo].includes(p.estado_actual?.nombre))
    }
    if (estatusActivo !== 'Todos') {
      lista = lista.filter(p => p.estado_actual?.nombre === estatusActivo)
    }
    return [...lista].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }, [pedidos, grupoActivo, estatusActivo])

  const toggleGrupo = (grupo) => {
    setGrupoActivo(prev => (prev === grupo ? null : grupo))
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titulo}>Pedidos</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#1F3864" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pedidos</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.resumen}>
        <Pressable
          style={[styles.resumenCard, grupoActivo === 'activos' && styles.resumenCardActiva, { backgroundColor: '#e3f2fd' }]}
          onPress={() => toggleGrupo('activos')}
        >
          <Text style={styles.resumenValor}>{conteos.activos}</Text>
          <Text style={styles.resumenLabel}>Activos</Text>
        </Pressable>
        <Pressable
          style={[styles.resumenCard, grupoActivo === 'pendientes' && styles.resumenCardActiva, { backgroundColor: '#fff8e1' }]}
          onPress={() => toggleGrupo('pendientes')}
        >
          <Text style={styles.resumenValor}>{conteos.pendientes}</Text>
          <Text style={styles.resumenLabel}>Pendientes</Text>
        </Pressable>
        <Pressable
          style={[styles.resumenCard, grupoActivo === 'finalizados' && styles.resumenCardActiva, { backgroundColor: '#eceff1' }]}
          onPress={() => toggleGrupo('finalizados')}
        >
          <Text style={styles.resumenValor}>{conteos.finalizados}</Text>
          <Text style={styles.resumenLabel}>Finalizados</Text>
        </Pressable>
      </View>

      <FlatList
        data={['Todos', ...estatusVisibles]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={styles.filtroFlatList}
        contentContainerStyle={styles.filtroFilaEstatus}
        renderItem={({ item }) => (
          <Pressable
            style={estatusActivo === item ? styles.chipActivo : styles.chip}
            onPress={() => setEstatusActivo(item)}
          >
            <Text style={estatusActivo === item ? styles.chipTextoActivo : styles.chipTexto}>
              {item === 'Todos' ? 'Todos' : ESTADOS_INFO[item].label}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.vacio}>No hay pedidos con estos filtros.</Text>}
        renderItem={({ item }) => {
          const nombreEstado = item.estado_actual?.nombre || 'pendiente'
          const info = ESTADOS_INFO[nombreEstado] || ESTADOS_INFO.pendiente
          return (
            <Pressable style={[styles.card, { backgroundColor: info.bg }]} onPress={() => onVerDetalle(item.id)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>Mesa {item.mesa?.numero ?? '—'} · #{item.id}</Text>
                <Text style={[styles.cardEstado, { color: info.color }]}>{info.label}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFecha}>{item.created_at?.slice(0, 10)}</Text>
                <Text style={styles.cardTotal}>${Number(item.total || 0).toFixed(2)}</Text>
              </View>
            </Pressable>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20, paddingBottom: 8 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
  resumen: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  resumenCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  resumenCardActiva: { borderColor: '#1F3864' },
  resumenValor: { fontSize: 20, fontWeight: 'bold', color: '#1F3864' },
  resumenLabel: { fontSize: 12, color: '#555555', marginTop: 2 },
  filtroFlatList: { flexGrow: 0, marginBottom: 12 },
  filtroFilaEstatus: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    alignSelf: 'flex-start',
    height: 34,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'center',
  },
  chipActivo: {
    alignSelf: 'flex-start',
    height: 34,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1F3864',
    justifyContent: 'center',
  },
  chipTexto: { fontSize: 13, color: '#555555' },
  chipTextoActivo: { fontSize: 13, color: '#ffffff', fontWeight: 'bold' },
  lista: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  vacio: { textAlign: 'center', color: '#999999', marginTop: 40 },
  card: { borderRadius: 12, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitulo: { fontSize: 15, fontWeight: 'bold', color: '#1F3864' },
  cardEstado: { fontSize: 12, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFecha: { fontSize: 12, color: '#888888' },
  cardTotal: { fontSize: 14, fontWeight: 'bold', color: '#1F3864' },
})