import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function PedidosScreen() {

  const pedidos = [
    {
      mesa: "Mesa 03",
      pedido: "#041",
      productos: ["2 Café", "1 Sandwich"],
    },
  ];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Cocina
      </Text>

      <View style={styles.tabs}>

        <Pressable style={styles.tabActivo}>
          <Text style={styles.tabActivoTexto}>
            Pendientes
          </Text>
        </Pressable>

        <Pressable style={styles.tab}>
          <Text>En prep.</Text>
        </Pressable>

        <Pressable style={styles.tab}>
          <Text>Listos</Text>
        </Pressable>

      </View>

      {pedidos.map((pedido, index) => (

        <View key={index} style={styles.card}>

          <Text style={styles.mesa}>
            {pedido.mesa} {pedido.pedido}
          </Text>

          {pedido.productos.map((producto, i) => (
            <Text key={i} style={styles.producto}>
              {producto}
            </Text>
          ))}

          <Pressable style={styles.boton}>
            <Text style={styles.textoBoton}>
              Detalles
            </Text>
          </Pressable>

        </View>

      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#fff",
    padding:20,
  },

  titulo:{
    fontSize:30,
    fontWeight:"bold",
    color:COLORS.primary,
    marginBottom:20,
  },

  tabs:{
    flexDirection:"row",
    marginBottom:20,
  },

  tabActivo:{
    backgroundColor:COLORS.primary,
    paddingHorizontal:15,
    paddingVertical:8,
    borderRadius:20,
    marginRight:10,
  },

  tabActivoTexto:{
    color:"white",
    fontWeight:"bold",
  },

  tab:{
    backgroundColor:"#F2F2F2",
    paddingHorizontal:15,
    paddingVertical:8,
    borderRadius:20,
    marginRight:10,
  },

  card:{
    backgroundColor:"#FFF9E8",
    padding:18,
    borderRadius:15,
  },

  mesa:{
    fontSize:28,
    fontWeight:"bold",
    marginBottom:10,
  },

  producto:{
    fontSize:22,
  },

  boton:{
    backgroundColor:COLORS.primary,
    marginTop:20,
    padding:14,
    borderRadius:10,
    alignItems:"center",
  },

  textoBoton:{
    color:"white",
    fontWeight:"bold",
    fontSize:17,
  },

});