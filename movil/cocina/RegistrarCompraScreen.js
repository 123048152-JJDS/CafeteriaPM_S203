import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function RegistrarCompraScreen() {

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Registrar Compra
      </Text>

      <Text style={styles.label}>
        Producto
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Leche"
      />

      <Text style={styles.label}>
        Cantidad
      </Text>

      <TextInput
        style={styles.input}
        placeholder="5"
        keyboardType="numeric"
      />

      <Text style={styles.label}>
        Unidad
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Litros"
      />

      <Text style={styles.label}>
        Proveedor
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Lala"
      />

      <Text style={styles.label}>
        Costo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="$250"
        keyboardType="numeric"
      />

      <Pressable style={styles.boton}>

        <Text style={styles.textoBoton}>
          Registrar Compra
        </Text>

      </Pressable>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#fff",
},

titulo:{
fontSize:30,
fontWeight:"bold",
color:COLORS.primary,
marginBottom:20,
},

label:{
fontSize:16,
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
marginTop:20,
backgroundColor:COLORS.primary,
padding:16,
borderRadius:10,
alignItems:"center",
},

textoBoton:{
color:"white",
fontWeight:"bold",
fontSize:17,
}

});