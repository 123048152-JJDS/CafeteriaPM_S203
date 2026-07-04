import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";

import ProductCard from "../components/ProductCard";
import { COLORS } from "../styles/colors";
import { productos } from "../utils/data";

export default function MenuCocinaScreen({ setScreen }) {
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>Menú</Text>

      <View style={styles.barraSuperior}>

        <TextInput
          placeholder="Buscar producto..."
          style={styles.buscador}
        />

        <Pressable style={styles.botonNuevo}>
          <Text style={styles.textoBoton}>Nuevo</Text>
        </Pressable>

      </View>

      <View style={styles.categorias}>

        <Pressable style={styles.categoriaActiva}>
          <Text style={styles.textoCategoriaActiva}>Todo</Text>
        </Pressable>

        <Pressable style={styles.categoria}>
          <Text style={styles.textoCategoria}>Bebidas</Text>
        </Pressable>

        <Pressable style={styles.categoria}>
          <Text style={styles.textoCategoria}>Comida</Text>
        </Pressable>

      </View>

      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          nombre={producto.nombre}
          categoria={producto.categoria}
          precio={producto.precio}
        />
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

  barraSuperior:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:20,
  },

  buscador:{
    flex:1,
    backgroundColor:"#fff",
    borderWidth:1,
    borderColor:COLORS.border,
    borderRadius:10,
    padding:12,
    marginRight:10,
  },

  botonNuevo:{
    backgroundColor:COLORS.primary,
    paddingHorizontal:18,
    paddingVertical:13,
    borderRadius:10,
  },

  textoBoton:{
    color:"white",
    fontWeight:"bold",
  },

  categorias:{
    flexDirection:"row",
    marginBottom:20,
  },

  categoriaActiva:{
    backgroundColor:COLORS.primary,
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:20,
    marginRight:10,
  },

  textoCategoriaActiva:{
    color:"white",
    fontWeight:"bold",
  },

  categoria:{
    backgroundColor:"white",
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:20,
    marginRight:10,
    borderWidth:1,
    borderColor:COLORS.border,
  },

  textoCategoria:{
    color:COLORS.text,
  },

  regresar:{
    marginTop:25,
    backgroundColor:COLORS.primary,
    padding:15,
    borderRadius:10,
    alignItems:"center",
  },

  textoRegresar:{
    color:"white",
    fontWeight:"bold",
    fontSize:16,
  }

});