import { useRouter } from "expo-router";
import MeseroEditarPedidoScreen from "../../../src/screens/MeseroEditarPedidoScreen";

export default function EditarPedido() {
  const router = useRouter();
  return <MeseroEditarPedidoScreen onListo={() => router.back()} />;
}