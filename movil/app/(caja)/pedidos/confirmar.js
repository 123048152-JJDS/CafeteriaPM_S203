import { useRouter } from "expo-router";
import CajaConfirmarPedidoScreen from "../../../src/screens/CajaConfirmarPedidoScreen";

export default function Confirmar() {
  const router = useRouter();
  return (
    <CajaConfirmarPedidoScreen
      onConfirmarCobro={(pedidoId) => router.push(`/pedidos/pagos?pedidoId=${pedidoId}`)}
    />
  );
}