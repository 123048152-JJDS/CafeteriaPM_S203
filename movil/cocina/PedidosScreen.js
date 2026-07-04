import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function PedidosScreen({ setScreen }) {

  const pedidos = [
    {
      mesa: "Mesa 03",
      pedido: "#041",
      productos: ["2 Café Americano", "1 Sandwich"],
    },
    {
      mesa: "Mesa 05",
      pedido: "#042",
      productos: ["1 Pay de Queso", "2 Capuchinos"],
    },
  ];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>Pedidos</Text>

      {pedidos.map((pedido, index) => (

        <View key={index} style={styles.card}>

          <Text style={styles.mesa}>
            {pedido.mesa} - {pedido.pedido}
          </Text>

          {pedido.productos.map((producto, i) => (
            <Text key={i} style={styles.producto}>
              • {producto}
            </Text>
          ))}

          <Pressable style={styles.botonDetalle}>
            <Text style={styles.textoBoton}>
              Ver detalles
            </Text>
          </Pressable>

        </View>

      ))}

      <Pressable
        style={styles.regresar}
        onPress={() => setScreen("menu")}
      >
        <Text style={styles.textoRegresar}>
          ← Regresar al menú
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#fff",
    paddingHorizontal:20,
    paddingTop:60,
},

  titulo:{
    fontSize:30,
    fontWeight:"bold",
    color:COLORS.primary,
    marginBottom:20,
  },

  card:{
    backgroundColor:"#FFF8E8",
    borderRadius:12,
    padding:15,
    marginBottom:20,
  },

  mesa:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:10,
  },

  producto:{
    fontSize:16,
    marginBottom:5,
  },

  botonDetalle:{
    backgroundColor:COLORS.primary,
    padding:12,
    borderRadius:10,
    marginTop:15,
    alignItems:"center",
  },

  textoBoton:{
    color:"#fff",
    fontWeight:"bold",
  },

  regresar:{
    backgroundColor:"#555",
    padding:15,
    borderRadius:10,
    alignItems:"center",
    marginTop:10,
  },

  textoRegresar:{
    color:"#fff",
    fontWeight:"bold",
  },

});