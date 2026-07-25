import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native'

const PEDIDOS = [
  { id: '041', mesa: 'Mesa 03', estado: 'pendiente',      total: 155.0, fecha: '2026-07-24' },
  { id: '042', mesa: 'Mesa 05', estado: 'en_preparacion', total: 90.0,  fecha: '2026-07-24' },
  { id: '043', mesa: 'Mesa 02', estado: 'listo',          total: 210.0, fecha: '2026-07-23' },
  { id: '044', mesa: 'Mesa 07', estado: 'entregado',      total: 75.0,  fecha: '2026-07-23' },
  { id: '045', mesa: 'Mesa 01', estado: 'pagado',         total: 130.0, fecha: '2026-07-20' },
  { id: '046', mesa: 'Mesa 04', estado: 'cancelado',      total: 60.0,  fecha: '2026-07-18' },
  { id: '047', mesa: 'Mesa 06', estado: 'pagado',         total: 95.0,  fecha: '2026-07-15' },
]

const ESTADOS_INFO = {
  pendiente:      { label: 'Pendiente',      color: '#f57f17', bg: '#fff8e1' },
  en_preparacion: { label: 'En preparación', color: '#e65100', bg: '#fff3e0' },
  listo:          { label: 'Listo',          color: '#2e7d32', bg: '#e8f5e9' },
  entregado:      { label: 'Entregado',      color: '#1565c0', bg: '#e3f2fd' },
  pagado:         { label: 'Pagado',         color: '#37474f', bg: '#eceff1' },
  cancelado:      { label: 'Cancelado',      color: '#c62828', bg: '#ffebee' },
}

const GRUPOS = {
  activos:      ['pendiente', 'en_preparacion', 'listo', 'entregado'],
  pendientes:   ['pendiente'],
  finalizados:  ['pagado', 'cancelado'],
}

const FILTROS_ESTATUS = ['Todos', 'pendiente', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado']
const FILTROS_FECHA = [
  { key: 'todos', label: 'Todos' },
  { key: 'hoy', label: 'Hoy' },
  { key: '7dias', label: 'Últimos 7 días' },
]

function coincideFecha(fechaPedido, filtroFecha) {
  if (filtroFecha === 'todos') return true
  const hoy = new Date('2026-07-24')
  const fecha = new Date(fechaPedido)
  const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24))
  if (filtroFecha === 'hoy') return diffDias === 0
  if (filtroFecha === '7dias') return diffDias >= 0 && diffDias <= 7
  return true
}

export default function MeseroPedidosScreen({ onVerDetalle }) {
  const [grupoActivo, setGrupoActivo] = useState(null)
  const [estatusActivo, setEstatusActivo] = useState('Todos')
  const [fechaActiva, setFechaActiva] = useState('todos')

  const conteos = useMemo(() => ({
    activos: PEDIDOS.filter(p => GRUPOS.activos.includes(p.estado)).length,
    pendientes: PEDIDOS.filter(p => GRUPOS.pendientes.includes(p.estado)).length,
    finalizados: PEDIDOS.filter(p => GRUPOS.finalizados.includes(p.estado)).length,
  }), [])

  const pedidosFiltrados = useMemo(() => {
    return PEDIDOS.filter(p => {
      if (grupoActivo && !GRUPOS[grupoActivo].includes(p.estado)) return false
      if (estatusActivo !== 'Todos' && p.estado !== estatusActivo) return false
      if (!coincideFecha(p.fecha, fechaActiva)) return false
      return true
    }).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  }, [grupoActivo, estatusActivo, fechaActiva])

  const toggleGrupo = (grupo) => setGrupoActivo(prev => (prev === grupo ? null : grupo))

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pedidos</Text>

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

      <View style={styles.filtroFila}>
        {FILTROS_FECHA.map(f => (
          <Pressable
            key={f.key}
            style={fechaActiva === f.key ? styles.chipActivo : styles.chip}
            onPress={() => setFechaActiva(f.key)}
          >
            <Text style={fechaActiva === f.key ? styles.chipTextoActivo : styles.chipTexto}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={FILTROS_ESTATUS}
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>No hay pedidos con estos filtros.</Text>}
        renderItem={({ item }) => {
          const info = ESTADOS_INFO[item.estado]
          return (
            <Pressable style={[styles.card, { backgroundColor: info.bg }]} onPress={() => onVerDetalle(item.id)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>{item.mesa} · #{item.id}</Text>
                <Text style={[styles.cardEstado, { color: info.color }]}>{info.label}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFecha}>{item.fecha}</Text>
                <Text style={styles.cardTotal}>${item.total.toFixed(2)}</Text>
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
  resumen: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  resumenCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  resumenCardActiva: { borderColor: '#1F3864' },
  resumenValor: { fontSize: 20, fontWeight: 'bold', color: '#1F3864' },
  resumenLabel: { fontSize: 12, color: '#555555', marginTop: 2 },
  filtroFila: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  filtroFlatList: {
    flexGrow: 0,
    marginBottom: 12,
  },
  filtroFilaEstatus: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
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