import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function DetallePedidoScreen({ setScreen }) {

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Detalle del Pedido
      </Text>

      <View style={styles.card}>

        <Text style={styles.mesa}>
          Mesa 03
        </Text>

        <Text style={styles.numero}>
          Pedido #041
        </Text>

      </View>

      <View style={styles.fila}>
        <Text>Café Americano</Text>
        <Text>x2</Text>
      </View>

      <View style={styles.fila}>
        <Text>Sandwich</Text>
        <Text>x1</Text>
      </View>

      <Text style={styles.subtitulo}>
        Notas
      </Text>

      <View style={styles.notas}>
        <Text>
          Sin azúcar y pan integral.
        </Text>
      </View>

      <Pressable style={styles.preparacion}>
        <Text style={styles.textoBoton}>
          En preparación
        </Text>
      </Pressable>

      <Pressable style={styles.listo}>
        <Text style={styles.textoBoton}>
          Marcar como listo
        </Text>
      </Pressable>

      <Pressable
        style={styles.regresar}
        onPress={() => setScreen("menu")}
      >
        <Text style={styles.textoBoton}>
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
padding:15,
borderRadius:10,
marginBottom:20,
},

mesa:{
fontSize:20,
fontWeight:"bold",
},

numero:{
marginTop:5,
},

fila:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:12,
borderBottomWidth:1,
borderBottomColor:"#EEE",
},

subtitulo:{
marginTop:20,
marginBottom:10,
fontWeight:"bold",
fontSize:17,
},

notas:{
backgroundColor:"#F5F5F5",
padding:15,
borderRadius:10,
marginBottom:20,
},

preparacion:{
backgroundColor:"#FF9800",
padding:15,
borderRadius:10,
alignItems:"center",
marginBottom:10,
},

listo:{
backgroundColor:"#4CAF50",
padding:15,
borderRadius:10,
alignItems:"center",
marginBottom:15,
},

regresar:{
backgroundColor:"#555",
padding:15,
borderRadius:10,
alignItems:"center",
},

textoBoton:{
color:"#fff",
fontWeight:"bold",
}

});