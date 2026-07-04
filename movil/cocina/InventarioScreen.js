import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/colors";

export default function InventarioScreen() {

  const inventario = [
    {
      producto:"Leche",
      unidad:"L",
      stock:"0.8"
    },
    {
      producto:"Harina",
      unidad:"kg",
      stock:"0.3"
    },
    {
      producto:"Café",
      unidad:"kg",
      stock:"2.4"
    }
  ];

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Inventario
      </Text>

      <View style={styles.alerta}>

        <Text style={styles.alertaTexto}>
          ⚠ Stock crítico:
        </Text>

        <Text style={styles.alertaTexto}>
          Leche, Harina
        </Text>

      </View>

      <View style={styles.encabezado}>

        <Text style={styles.enc}>Producto</Text>

        <Text style={styles.enc}>Unidad</Text>

        <Text style={styles.enc}>Stock</Text>

      </View>

      {

        inventario.map((item,index)=>(

          <View
            key={index}
            style={styles.fila}
          >

            <Text style={styles.txt}>
              {item.producto}
            </Text>

            <Text style={styles.txt}>
              {item.unidad}
            </Text>

            <Text
              style={[
                styles.txt,
                item.stock<1 && styles.rojo
              ]}
            >
              {item.stock}
            </Text>

          </View>

        ))

      }

      <Pressable style={styles.boton}>

        <Text style={styles.textoBoton}>
          Registrar compra
        </Text>

      </Pressable>

    </ScrollView>

  );

}

const styles=StyleSheet.create({

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

alerta:{
backgroundColor:"#FDECEC",
padding:15,
borderRadius:10,
marginBottom:25,
},

alertaTexto:{
fontSize:18,
fontWeight:"bold",
color:"#C62828",
},

encabezado:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:12,
},

enc:{
fontWeight:"bold",
width:"33%",
},

fila:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:10,
borderBottomWidth:1,
borderBottomColor:"#ECECEC",
},

txt:{
width:"33%",
fontSize:16,
},

rojo:{
color:"red",
fontWeight:"bold",
},

boton:{
marginTop:35,
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