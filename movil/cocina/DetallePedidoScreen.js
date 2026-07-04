import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function DetallePedidoScreen() {

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Detalle del Pedido
      </Text>

      <View style={styles.card}>

        <Text style={styles.mesa}>
          Mesa 03
        </Text>

        <Text style={styles.pedido}>
          Pedido #041
        </Text>

      </View>

      <View style={styles.producto}>

        <Text style={styles.nombre}>
          Café Americano
        </Text>

        <Text style={styles.cantidad}>
          x2
        </Text>

      </View>

      <View style={styles.producto}>

        <Text style={styles.nombre}>
          Sandwich
        </Text>

        <Text style={styles.cantidad}>
          x1
        </Text>

      </View>

      <Text style={styles.notasTitulo}>
        Notas
      </Text>

      <View style={styles.notas}>

        <Text>
          Sin azúcar y pan integral.
        </Text>

      </View>

      <Pressable style={styles.preparando}>

        <Text style={styles.texto}>
          En preparación
        </Text>

      </Pressable>

      <Pressable style={styles.listo}>

        <Text style={styles.texto}>
          Marcar como listo
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

card:{
backgroundColor:"#FFF9E8",
padding:15,
borderRadius:10,
marginBottom:20,
},

mesa:{
fontSize:22,
fontWeight:"bold",
},

pedido:{
marginTop:5,
fontSize:17,
},

producto:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:15,
borderBottomWidth:1,
borderBottomColor:"#ECECEC",
},

nombre:{
fontSize:18,
},

cantidad:{
fontWeight:"bold",
fontSize:18,
},

notasTitulo:{
marginTop:20,
fontWeight:"bold",
fontSize:18,
marginBottom:8,
},

notas:{
backgroundColor:"#F7F7F7",
padding:15,
borderRadius:10,
marginBottom:25,
},

preparando:{
backgroundColor:"#FF9800",
padding:15,
borderRadius:10,
alignItems:"center",
marginBottom:15,
},

listo:{
backgroundColor:"#4CAF50",
padding:15,
borderRadius:10,
alignItems:"center",
},

texto:{
color:"white",
fontWeight:"bold",
fontSize:17,
}

});