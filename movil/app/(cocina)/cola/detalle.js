import { useRouter } from "expo-router";
import CocinaDetallePedidoScreen from "../../../src/screens/CocinaDetallePedidoScreen";

export default function DetallePedido() {
  const router = useRouter();
  return <CocinaDetallePedidoScreen onMarcarListo={() => router.back()} />;
}