import { useRouter } from "expo-router";
import MeseroPedidosScreen from "../../../src/screens/MeseroPedidosScreen";

export default function Seguimiento() {
  const router = useRouter();
  return (
    <MeseroPedidosScreen
      onVerDetalle={(pedidoId) => router.push(`/pedidos/detalle?pedidoId=${pedidoId}`)}
    />
  );
}