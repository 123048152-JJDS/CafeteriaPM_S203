import { useRouter } from "expo-router";
import CajaPagosScreen from "../../../src/screens/CajaPagosScreen";

export default function Pagos() {
  const router = useRouter();

  const handlePagar = ({ metodo, montoRecibido, cambio, total }) => {
    const params = new URLSearchParams({
      metodo,
      montoRecibido: montoRecibido.toFixed(2),
      cambio: cambio.toFixed(2),
      total: total.toFixed(2),
    }).toString();
    router.push(`/pedidos/ticket?${params}`);
  };

  return <CajaPagosScreen onPagar={handlePagar} />;
}