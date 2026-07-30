import { api } from './api'

let cache = null

export async function obtenerMapaEstados(token) {
  if (cache) return cache
  const estados = await api.get('/pedidos/estados', token)
  cache = estados.reduce((acc, e) => {
    acc[e.nombre] = e.id
    return acc
  }, {})
  return cache
}