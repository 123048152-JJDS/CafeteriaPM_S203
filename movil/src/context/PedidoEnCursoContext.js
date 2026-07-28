import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const PedidoEnCursoContext = createContext(null)

export function PedidoEnCursoProvider({ children }) {
  const [items, setItems] = useState([]) // [{ id, nombre, precio, cantidad }]
  const [mesaActivaId, setMesaActivaId] = useState(null)
  const [observaciones, setObservaciones] = useState('')

  const iniciarParaMesa = useCallback((mesaId) => {
    setMesaActivaId(prev => {
      if (String(prev) !== String(mesaId)) {
        setItems([])
        setObservaciones('')
      }
      return mesaId
    })
  }, [])

  const agregarProducto = (producto) => {
    setItems(prev => {
      const existente = prev.find(i => i.id === producto.id)
      if (existente) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (id, delta) => {
    setItems(prev =>
      prev
        .map(i => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter(i => i.cantidad > 0)
    )
  }

  const limpiar = () => {
    setItems([])
    setMesaActivaId(null)
    setObservaciones('')
  }

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    [items]
  )

  const cantidadTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.cantidad, 0),
    [items]
  )

  return (
    <PedidoEnCursoContext.Provider
      value={{
        items,
        observaciones,
        setObservaciones,
        agregarProducto,
        cambiarCantidad,
        limpiar,
        total,
        cantidadTotal,
        iniciarParaMesa,
        mesaActivaId,
      }}
    >
      {children}
    </PedidoEnCursoContext.Provider>
  )
}

export function usePedidoEnCurso() {
  const ctx = useContext(PedidoEnCursoContext)
  if (!ctx) throw new Error('usePedidoEnCurso debe usarse dentro de PedidoEnCursoProvider')
  return ctx
}