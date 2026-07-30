import { useRouter, useLocalSearchParams } from "expo-router";
import CajaPagosScreen from "../../../src/screens/CajaPagosScreen";

export default function Pagos() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams();

  const handlePagar = ({ ventaId, metodo, montoRecibido, cambio, total }) => {
    const params = new URLSearchParams({
      pedidoId: String(pedidoId),
      ventaId: String(ventaId),
      metodo,
      montoRecibido,
      cambio,
      total,
    }).toString();
    router.push(`/pedidos/ticket?${params}`);
  };

  return <CajaPagosScreen onPagar={handlePagar} />;
}