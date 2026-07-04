import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MenuScreen from "./screens/MenuScreen";

import MenuCocinaScreen from "./cocina/MenuCocinaScreen";
import NuevoProductoScreen from "./cocina/NuevoProductoScreen";
import InventarioScreen from "./cocina/InventarioScreen";
import RegistrarCompraScreen from "./cocina/RegistrarCompraScreen";
import PedidosScreen from "./cocina/PedidosScreen";
import DetallePedidoScreen from "./cocina/DetallePedidoScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Inicio"
          component={MenuScreen}
        />

        <Stack.Screen
          name="Menu Cocina"
          component={MenuCocinaScreen}
        />

        <Stack.Screen
          name="Nuevo Producto"
          component={NuevoProductoScreen}
        />

        <Stack.Screen
          name="Inventario"
          component={InventarioScreen}
        />

        <Stack.Screen
          name="Registrar Compra"
          component={RegistrarCompraScreen}
        />

        <Stack.Screen
          name="Pedidos"
          component={PedidosScreen}
        />

        <Stack.Screen
          name="Detalle Pedido"
          component={DetallePedidoScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}