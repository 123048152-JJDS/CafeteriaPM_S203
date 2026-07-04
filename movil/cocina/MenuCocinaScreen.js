import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";

import ProductCard from "../components/ProductCard";
import { COLORS } from "../styles/colors";
import { productos } from "../utils/data";

export default function MenuCocinaScreen() {

  

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.titulo}>
        Menú
      </Text>

      <View style={styles.barraSuperior}>

        <TextInput
          placeholder="Buscar producto..."
          style={styles.buscador}
        />

        <Pressable style={styles.botonNuevo}>
          <Text style={styles.textoBoton}>
            Nuevo
          </Text>
        </Pressable>

      </View>

      <View style={styles.categorias}>

        <Pressable style={styles.categoriaActiva}>
          <Text style={styles.textoCategoriaActiva}>
            Todo
          </Text>
        </Pressable>

        <Pressable style={styles.categoria}>
          <Text style={styles.textoCategoria}>
            Bebidas
          </Text>
        </Pressable>

        <Pressable style={styles.categoria}>
          <Text style={styles.textoCategoria}>
            Comida
          </Text>
        </Pressable>

      </View>

      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          nombre={producto.nombre}
          categoria={producto.categoria}
          precio={producto.precio}
        />
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },

  barraSuperior: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  buscador: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginRight: 10,
  },

  botonNuevo: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 10,
  },

  textoBoton: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  categorias: {
    flexDirection: "row",
    marginBottom: 20,
  },

  categoriaActiva: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  textoCategoriaActiva: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  categoria: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  textoCategoria: {
    color: COLORS.text,
  },

});