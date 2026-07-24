import { useRouter } from "expo-router";
import SeleccionModuloScreen from "../src/screens/SeleccionModuloScreen";

const RUTA_POR_MODULO = {
  mesero: "/mesas",
  caja: "/pedidos",
  cocina: "/cola",
};

export default function SeleccionModulo() {
  const router = useRouter();
  return (
    <SeleccionModuloScreen
      onSeleccionar={(modulo) => router.replace(RUTA_POR_MODULO[modulo])}
    />
  );
}