import { useRouter } from "expo-router";
import MeseroDetalleMesaScreen from "../../../src/screens/MeseroDetalleMesaScreen";

export default function Detalle() {
  const router = useRouter();
  return (
    <MeseroDetalleMesaScreen
      onAgregarPedido={(mesaId, pedidoId) =>
        router.push(`/mesas/catalogo?mesaId=${mesaId}&pedidoId=${pedidoId}`)
      }
      onLiberar={() => router.replace("/mesas")}
    />
  );
}