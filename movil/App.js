import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Pressable,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  const [pantalla, setPantalla] = useState('pedidos')
  const [metodoPago, setMetodoPago] = useState('Efectivo')

  const [descripcion, setDescripcion] = useState('Compra leche')
  const [monto, setMonto] = useState('85.00')
  const [categoria, setCategoria] = useState('Suministros')
  const [fecha, setFecha] = useState('26 May 2025')

  const pedidos = [
    {
      id: '039',
      mesa: 'Mesa 01',
      estado: 'Listo',
      productos: '2 Café · 1 Sandwich',
    },
    {
      id: '040',
      mesa: 'Mesa 05',
      estado: 'Cocina',
      productos: '3 Capuchino · 2 Pay',
    },
  ]

  const productos = [
    { id: '1', cantidad: '2', nombre: 'Café', precio: '$70', status: 'Listo' },
    { id: '2', cantidad: '1', nombre: 'Sandwich', precio: '$85', status: 'Listo' },
  ]

  const guardarGasto = () => {
    Alert.alert(
      'Gasto guardado',
      `Descripción: ${descripcion}\nMonto: $${monto}\nCategoría: ${categoria}`
    )
  }

  const pagarPedido = () => {
    Alert.alert('Pago realizado', `Método de pago: ${metodoPago}`)
    setPantalla('ticket')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.hora}>9:41</Text>

        {pantalla === 'pedidos' && <Text style={styles.titulo}>Pedidos activos</Text>}
        {pantalla === 'confirmar' && <Text style={styles.titulo}>Confirmar · Mesa 01</Text>}
        {pantalla === 'pago' && <Text style={styles.titulo}>Pagar · Mesa 01</Text>}
        {pantalla === 'ticket' && <Text style={styles.titulo}>Ticket #039</Text>}
        {pantalla === 'balance' && <Text style={styles.titulo}>Balance 26 May</Text>}
        {pantalla === 'gasto' && <Text style={styles.titulo}>Registrar gasto</Text>}
      </View>

      {pantalla === 'pedidos' && (
        <View style={styles.contenido}>
          <FlatList
            data={pedidos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={item.estado === 'Listo' ? styles.cardVerde : styles.card}>
                <Text style={styles.cardTitulo}>
                  {item.mesa} #{item.id}
                </Text>

                <Text
                  style={
                    item.estado === 'Listo'
                      ? styles.estadoListo
                      : styles.estadoCocina
                  }
                >
                  {item.estado}
                </Text>

                <Text style={styles.textoGrande}>{item.productos}</Text>

                <Pressable
                  style={styles.botonAzul}
                  onPress={() => setPantalla('confirmar')}
                >
                  <Text style={styles.textoBoton}>Detalle</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      )}

      {pantalla === 'confirmar' && (
        <ScrollView style={styles.contenido}>
          <Text style={styles.subtitulo}>Productos del pedido</Text>

          <FlatList
            data={productos}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.fila}>
                <Text>{item.cantidad}</Text>
                <Text>{item.nombre}</Text>
                <Text>{item.precio}</Text>
                <Text style={styles.estadoListo}>{item.status}</Text>
              </View>
            )}
          />

          <View style={styles.nota}>
            <Text style={styles.textoGrande}>Sin cebolla</Text>
          </View>

          <View style={styles.total}>
            <Text style={styles.textoGrande}>Total</Text>
            <Text style={styles.totalTexto}>$155.00</Text>
          </View>

          <Pressable style={styles.botonBlanco} onPress={() => setPantalla('pedidos')}>
            <Text style={styles.textoAzul}>Modificar</Text>
          </Pressable>

          <Pressable style={styles.botonAzul} onPress={() => setPantalla('pago')}>
            <Text style={styles.textoBoton}>Confirmar cobro</Text>
          </Pressable>
        </ScrollView>
      )}

      {pantalla === 'pago' && (
        <ScrollView style={styles.contenido}>
          <Text style={styles.precio}>$155.00</Text>

          <View style={styles.metodos}>
            {['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'].map((metodo) => (
              <Pressable
                key={metodo}
                style={
                  metodoPago === metodo ? styles.metodoActivo : styles.metodo
                }
                onPress={() => setMetodoPago(metodo)}
              >
                <Text
                  style={
                    metodoPago === metodo
                      ? styles.textoBoton
                      : styles.textoAzul
                  }
                >
                  {metodo}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.botonVerde} onPress={pagarPedido}>
            <Text style={styles.textoBoton}>Pagar / Ticket</Text>
          </Pressable>
        </ScrollView>
      )}

      {pantalla === 'ticket' && (
        <ScrollView style={styles.contenido}>
          <Text style={styles.negocio}>CafeteriaPM</Text>
          <Text style={styles.mesa}>Mesa 01</Text>

          <View style={styles.linea} />

          <Text style={styles.textoGrande}>2x Café Americano</Text>
          <Text style={styles.textoGrande}>...... $70</Text>

          <Text style={styles.textoGrande}>1x Sandwich Club</Text>
          <Text style={styles.textoGrande}>...... $85</Text>

          <View style={styles.linea} />

          <Text style={styles.totalTexto}>Total $155.00</Text>

          <Pressable
            style={styles.botonBlanco}
            onPress={() => Alert.alert('Ticket', 'Ticket impreso')}
          >
            <Text style={styles.textoAzul}>Imprimir</Text>
          </Pressable>

          <Pressable
            style={styles.botonBlanco}
            onPress={() => Alert.alert('Ticket', 'Ticket compartido')}
          >
            <Text style={styles.textoAzul}>Compartir</Text>
          </Pressable>
        </ScrollView>
      )}

      {pantalla === 'balance' && (
        <ScrollView style={styles.contenido}>
          <View style={styles.kpis}>
            <View style={styles.kpi}>
              <Text style={styles.textoGrande}>Ventas</Text>
              <Text style={styles.totalTexto}>$3,420</Text>
            </View>

            <View style={styles.kpi}>
              <Text style={styles.textoGrande}>Gastos</Text>
              <Text style={styles.totalTexto}>$840</Text>
            </View>

            <View style={styles.kpi}>
              <Text style={styles.textoGrande}>Ganancia</Text>
              <Text style={styles.totalTexto}>$2,580</Text>
            </View>

            <View style={styles.kpi}>
              <Text style={styles.textoGrande}>Pedidos</Text>
              <Text style={styles.totalTexto}>18</Text>
            </View>
          </View>

          <Text style={styles.grafica}>📊 Gráfica ventas por hora</Text>
        </ScrollView>
      )}

      {pantalla === 'gasto' && (
        <ScrollView style={styles.contenido}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.label}>Monto ($)</Text>
          <TextInput
            style={styles.input}
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
          />

          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={fecha}
            onChangeText={setFecha}
          />

          <Pressable style={styles.botonAzul} onPress={guardarGasto}>
            <Text style={styles.textoBoton}>Guardar gasto</Text>
          </Pressable>
        </ScrollView>
      )}

      <View style={styles.menu}>
        <Pressable onPress={() => setPantalla('pedidos')}>
          <Text style={styles.opcion}>Pedidos</Text>
        </Pressable>

        <Pressable onPress={() => setPantalla('balance')}>
          <Text style={styles.opcion}>Balance</Text>
        </Pressable>

        <Pressable onPress={() => setPantalla('gasto')}>
          <Text style={styles.opcion}>Gastos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE5EE',
  },

  hora: {
    color: '#8CA0B5',
    fontSize: 14,
  },

  titulo: {
    fontSize: 22,
    color: '#1B2A41',
    marginTop: 10,
  },

  contenido: {
    flex: 1,
    padding: 16,
  },

  card: {
    backgroundColor: '#F7F9FC',
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
  },

  cardVerde: {
    backgroundColor: '#E6F2EE',
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
  },

  cardTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  estadoListo: {
    color: '#2E7D4F',
    fontSize: 18,
  },

  estadoCocina: {
    color: '#F28C00',
    fontSize: 18,
  },

  textoGrande: {
    fontSize: 20,
    marginVertical: 5,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E7EF',
    paddingVertical: 10,
  },

  nota: {
    backgroundColor: '#F3F6FA',
    padding: 12,
    borderRadius: 10,
    marginTop: 40,
  },

  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },

  totalTexto: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  precio: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
  },

  metodos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },

  metodo: {
    width: '45%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE5EE',
    alignItems: 'center',
  },

  metodoActivo: {
    width: '45%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2F724E',
    alignItems: 'center',
  },

  botonAzul: {
    backgroundColor: '#314A7E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  botonVerde: {
    backgroundColor: '#2F724E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },

  botonBlanco: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE5EE',
    marginTop: 12,
  },

  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  textoAzul: {
    color: '#314A7E',
    fontSize: 16,
  },

  negocio: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  mesa: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 15,
  },

  linea: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDE5EE',
    marginVertical: 15,
  },

  kpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  kpi: {
    width: '47%',
    backgroundColor: '#F3F6FA',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  grafica: {
    marginTop: 40,
    fontSize: 16,
  },

  label: {
    color: '#5C6F88',
    marginTop: 12,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDE5EE',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  menu: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#DDE5EE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  opcion: {
    color: '#314A7E',
    fontSize: 15,
    fontWeight: 'bold',
  },
})