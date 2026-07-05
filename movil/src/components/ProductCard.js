import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ProductCard({ nombre, categoria, precio }) {
  return (
    <View style={styles.card}>

      <View style={styles.imagen}></View>

      <View style={styles.info}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.categoria}>{categoria}</Text>
        <Text style={styles.precio}>${precio}</Text>
      </View>

      <Pressable style={styles.boton}>
        <Text style={styles.textoBoton}>Editar</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
  },
  imagen: {
    width: 65,
    height: 65,
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  nombre: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
  },
  categoria: {
    color: "#9E9E9E",
    marginTop: 3,
  },
  precio: {
    color: "#243B74",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 16,
  },
  boton: {
    backgroundColor: "#243B74",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBoton: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});