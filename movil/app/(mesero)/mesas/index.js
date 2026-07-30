import { useRouter } from "expo-router";
import MeseroMesasScreen from "../../../src/screens/MeseroMesasScreen";

export default function Mesas() {
  const router = useRouter();

  const handleNuevoPedido = (mesaId) => {
    router.push(`/mesas/catalogo?mesaId=${mesaId}`);
  };

  const handleVerMesa = (mesaId, estado, pedidoActivoId) => {
    router.push(`/mesas/detalle?mesaId=${mesaId}&estado=${estado}&pedidoId=${pedidoActivoId}`);
  };

  return <MeseroMesasScreen onNuevoPedido={handleNuevoPedido} onVerMesa={handleVerMesa} />;
}