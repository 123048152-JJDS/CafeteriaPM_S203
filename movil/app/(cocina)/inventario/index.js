import { useRouter } from "expo-router";
import CocinaInventarioScreen from "../../../src/screens/CocinaInventarioScreen";

export default function Inventario() {
  const router = useRouter();
  return (
    <CocinaInventarioScreen
      onRegistrarCompra={() => router.push("/inventario/registrar-compra")}
    />
  );
}