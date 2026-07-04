import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Módulo Cocina</Text>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Pedidos")}
      >
        <Text style={styles.textoBoton}>Pedidos</Text>
      </Pressable>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Detalle Pedido")}
      >
        <Text style={styles.textoBoton}>Detalle Pedido</Text>
      </Pressable>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Inventario")}
      >
        <Text style={styles.textoBoton}>Inventario</Text>
      </Pressable>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Registrar Compra")}
      >
        <Text style={styles.textoBoton}>Registrar Compra</Text>
      </Pressable>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Menu Cocina")}
      >
        <Text style={styles.textoBoton}>Menú</Text>
      </Pressable>

      <Pressable
        style={styles.boton}
        onPress={() => navigation.navigate("Nuevo Producto")}
      >
        <Text style={styles.textoBoton}>Nuevo Producto</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 35,
    color: "#243B74",
  },

  boton: {
    backgroundColor: "#243B74",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  textoBoton: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});