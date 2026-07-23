import { useRouter } from "expo-router";
import SeleccionModuloScreen from "../src/screens/SeleccionModuloScreen";

export default function SeleccionModulo() {
  const router = useRouter();
  return (
    <SeleccionModuloScreen
      onSeleccionar={(modulo) => {
        // Los grupos (mesero)/(caja)/(cocina) los creamos en los Pasos 4-6.
        // Por ahora esto navegará a una ruta que todavía no existe — es esperado.
        router.replace(`/(${modulo})`);
      }}
    />
  );
}