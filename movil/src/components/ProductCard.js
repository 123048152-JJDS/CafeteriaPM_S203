import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ProductCard({ id, nombre, categoria, precio, disponible, onEditar }) {
  return (
    <View style={styles.card}>
      <View style={[styles.imagen, !disponible && styles.imagenNoDisponible]} />

      <View style={styles.info}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.categoria}>{categoria}</Text>
        <View style={styles.filaInferior}>
          <Text style={styles.precio}>${precio}</Text>
          {!disponible && <Text style={styles.badgeNoDisponible}>No disponible</Text>}
        </View>
      </View>

      <Pressable
        style={styles.boton}
        onPress={() => onEditar && onEditar({ id, nombre, categoria, precio })}
      >
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
  imagenNoDisponible: {
    opacity: 0.4,
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
  filaInferior: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  precio: {
    color: "#243B74",
    fontWeight: "bold",
    fontSize: 16,
  },
  badgeNoDisponible: {
    fontSize: 10,
    color: "#c62828",
    fontWeight: "bold",
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