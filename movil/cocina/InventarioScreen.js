import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function InventarioScreen({ setScreen }) {

  const inventario = [
    { producto: "Leche", unidad: "L", stock: "0.8" },
    { producto: "Harina", unidad: "kg", stock: "0.3" },
    { producto: "Café", unidad: "kg", stock: "2.4" },
  ];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>Inventario</Text>

      <View style={styles.alerta}>
        <Text style={styles.alertaTexto}>⚠ Stock crítico</Text>
        <Text style={styles.alertaTexto}>Leche, Harina</Text>
      </View>

      <View style={styles.encabezado}>
        <Text style={styles.enc}>Producto</Text>
        <Text style={styles.enc}>Unidad</Text>
        <Text style={styles.enc}>Stock</Text>
      </View>

      {inventario.map((item, index) => (

        <View key={index} style={styles.fila}>

          <Text style={styles.txt}>{item.producto}</Text>

          <Text style={styles.txt}>{item.unidad}</Text>

          <Text
            style={[
              styles.txt,
              Number(item.stock) < 1 && styles.rojo,
            ]}
          >
            {item.stock}
          </Text>

        </View>

      ))}

      <Pressable style={styles.boton}>
        <Text style={styles.textoBoton}>
          Registrar compra
        </Text>
      </Pressable>

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

  alerta:{
    backgroundColor:"#FDECEC",
    padding:15,
    borderRadius:10,
    marginBottom:20,
  },

  alertaTexto:{
    color:"#C62828",
    fontWeight:"bold",
  },

  encabezado:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:10,
  },

  enc:{
    width:"33%",
    fontWeight:"bold",
  },

  fila:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingVertical:12,
    borderBottomWidth:1,
    borderBottomColor:"#EEE",
  },

  txt:{
    width:"33%",
  },

  rojo:{
    color:"red",
    fontWeight:"bold",
  },

  boton:{
    backgroundColor:COLORS.primary,
    marginTop:25,
    padding:15,
    borderRadius:10,
    alignItems:"center",
  },

  textoBoton:{
    color:"white",
    fontWeight:"bold",
  },

  regresar:{
    backgroundColor:"#555",
    marginTop:15,
    padding:15,
    borderRadius:10,
    alignItems:"center",
  },

  textoRegresar:{
    color:"white",
    fontWeight:"bold",
  }

});