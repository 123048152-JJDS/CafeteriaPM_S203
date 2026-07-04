import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function RegistrarCompraScreen({ setScreen }) {

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Registrar Compra
      </Text>

      <Text style={styles.label}>Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Leche"
      />

      <Text style={styles.label}>Cantidad</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="5"
      />

      <Text style={styles.label}>Unidad</Text>

      <TextInput
        style={styles.input}
        placeholder="Litros"
      />

      <Text style={styles.label}>Proveedor</Text>

      <TextInput
        style={styles.input}
        placeholder="Lala"
      />

      <Text style={styles.label}>Costo</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="$250"
      />

      <Pressable style={styles.boton}>

        <Text style={styles.textoBoton}>
          Registrar Compra
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
},

input:{
borderWidth:1,
borderColor:"#DDD",
borderRadius:10,
padding:14,
marginBottom:15,
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
marginTop:20,
borderRadius:10,
alignItems:"center",
},

textoRegresar:{
color:"white",
fontWeight:"bold",
}

});