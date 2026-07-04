import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function NuevoProductoScreen({ setScreen }) {

  const [disponible, setDisponible] = useState(true);

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>Nuevo producto</Text>

      <Text style={styles.label}>Nombre</Text>

      <TextInput
        style={styles.input}
        placeholder="Capuchino"
      />

      <Text style={styles.label}>Precio ($)</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="65"
      />

      <Text style={styles.label}>Categoría</Text>

      <TextInput
        style={styles.input}
        placeholder="Bebidas"
      />

      <Text style={styles.label}>Ingredientes</Text>

      <TextInput
        style={styles.input}
        placeholder="Café, Leche"
      />

      <View style={styles.switchContainer}>

        <Switch
          value={disponible}
          onValueChange={setDisponible}
        />

        <Text style={styles.switchText}>
          Disponible en menú
        </Text>

      </View>

      <Pressable style={styles.boton}>

        <Text style={styles.textoBoton}>
          Guardar producto
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

  label:{
    marginBottom:6,
    color:"#666",
    fontSize:15,
  },

  input:{
    borderWidth:1,
    borderColor:"#DDD",
    borderRadius:10,
    padding:14,
    marginBottom:15,
  },

  switchContainer:{
    flexDirection:"row",
    alignItems:"center",
    marginVertical:20,
  },

  switchText:{
    marginLeft:10,
    fontSize:16,
  },

  boton:{
    backgroundColor:COLORS.primary,
    padding:16,
    borderRadius:10,
    alignItems:"center",
  },

  textoBoton:{
    color:"white",
    fontWeight:"bold",
    fontSize:17,
  },

  regresar:{
    backgroundColor:"#555",
    padding:15,
    borderRadius:10,
    alignItems:"center",
    marginTop:20,
  },

  textoRegresar:{
    color:"white",
    fontWeight:"bold",
    fontSize:16,
  }

});