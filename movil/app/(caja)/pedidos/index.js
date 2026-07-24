import { useRouter } from "expo-router";
import CajaPedidosActivosScreen from "../../../src/screens/CajaPedidosActivosScreen";

export default function PedidosActivos() {
  const router = useRouter();
  return (
    <CajaPedidosActivosScreen
      onVerDetalle={(pedidoId) => router.push(`/pedidos/confirmar?pedidoId=${pedidoId}`)}
    />
  );
}