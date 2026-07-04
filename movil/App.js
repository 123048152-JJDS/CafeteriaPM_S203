import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, Pressable } from "react-native";
import { useState } from "react";

import MenuScreen from "./screens/MenuScreen";

import MenuCocinaScreen from "./cocina/MenuCocinaScreen";
import NuevoProductoScreen from "./cocina/NuevoProductoScreen";
import InventarioScreen from "./cocina/InventarioScreen";
import RegistrarCompraScreen from "./cocina/RegistrarCompraScreen";
import PedidosScreen from "./cocina/PedidosScreen";
import DetallePedidoScreen from "./cocina/DetallePedidoScreen";

export default function App() {

  const [screen, setScreen] = useState("menu");

  switch (screen) {

    case "menuCocina":
      return <MenuCocinaScreen setScreen={setScreen} />;

    case "nuevoProducto":
      return <NuevoProductoScreen setScreen={setScreen} />;

    case "inventario":
      return <InventarioScreen setScreen={setScreen} />;

    case "registrarCompra":
      return <RegistrarCompraScreen setScreen={setScreen} />;

    case "pedidos":
      return <PedidosScreen setScreen={setScreen} />;

    case "detallePedido":
      return <DetallePedidoScreen setScreen={setScreen} />;

    case "menu":
    default:

      return (

        <SafeAreaView style={styles.container}>

          <Text style={styles.titulo}>
            Módulo Cocina
          </Text>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("menuCocina")}
          >
            <Text style={styles.texto}>
              Menú
            </Text>
          </Pressable>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("nuevoProducto")}
          >
            <Text style={styles.texto}>
              Nuevo Producto
            </Text>
          </Pressable>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("inventario")}
          >
            <Text style={styles.texto}>
              Inventario
            </Text>
          </Pressable>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("registrarCompra")}
          >
            <Text style={styles.texto}>
              Registrar Compra
            </Text>
          </Pressable>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("pedidos")}
          >
            <Text style={styles.texto}>
              Pedidos
            </Text>
          </Pressable>

          <Pressable
            style={styles.boton}
            onPress={() => setScreen("detallePedido")}
          >
            <Text style={styles.texto}>
              Detalle Pedido
            </Text>
          </Pressable>

          <StatusBar style="auto" />

        </SafeAreaView>

      );

  }

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#fff",
    justifyContent:"space-evenly",
    padding:20,
  },

  titulo:{
    fontSize:28,
    fontWeight:"bold",
    color:"#243B74",
    textAlign:"center",
  },

  boton:{
    backgroundColor:"#243B74",
    padding:16,
    borderRadius:10,
  },

  texto:{
    color:"white",
    fontWeight:"bold",
    textAlign:"center",
    fontSize:17,
  }

});