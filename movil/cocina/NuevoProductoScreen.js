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

export default function NuevoProductoScreen() {

  const [disponible, setDisponible] = useState(true);

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Nuevo producto
      </Text>

      <Text style={styles.label}>
        Nombre
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Capuchino"
      />

      <Text style={styles.label}>
        Precio ($)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="65.00"
        keyboardType="numeric"
      />

      <Text style={styles.label}>
        Categoría
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Bebidas"
      />

      <Text style={styles.label}>
        Ingredientes
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Café 18g, Leche 150ml"
      />

      <View style={styles.switchContainer}>

        <Switch
          value={disponible}
          onValueChange={setDisponible}
          trackColor={{
            false: "#DADADA",
            true: COLORS.primary,
          }}
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

  label:{
    fontSize:15,
    color:"#666",
    marginBottom:6,
    marginTop:8,
  },

  input:{
    borderWidth:1,
    borderColor:"#DDD",
    borderRadius:10,
    padding:14,
    backgroundColor:"#fff",
    marginBottom:10,
  },

  switchContainer:{
    flexDirection:"row",
    alignItems:"center",
    marginVertical:18,
  },

  switchText:{
    marginLeft:10,
    fontSize:18,
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

});