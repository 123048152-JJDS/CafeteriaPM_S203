import { Redirect } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../src/context/AuthContext";

const ROL_A_RUTA = {
  mesero: "/mesas",
  caja: "/pedidos",
  cocina: "/cola",
};

export default function Index() {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <Text style={{ marginTop: 100, textAlign: "center" }}>Cargando...</Text>;
  }

  if (auth?.rol && ROL_A_RUTA[auth.rol]) {
    return <Redirect href={ROL_A_RUTA[auth.rol]} />;
  }

  return <Redirect href="/welcome" />;
}