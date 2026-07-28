import { useRouter } from "expo-router";
import MeseroDetalleMesaScreen from "../../../src/screens/MeseroDetalleMesaScreen";

export default function Detalle() {
  const router = useRouter();
  return (
    <MeseroDetalleMesaScreen
      onEditarPedido={(mesaId, pedidoId) =>
        router.push(`/mesas/editar-pedido?mesaId=${mesaId}&pedidoId=${pedidoId}`)
      }
      onOcuparMesa={(mesaId, pedidoId) =>
        router.replace(`/mesas/editar-pedido?mesaId=${mesaId}&pedidoId=${pedidoId}`)
      }
      onCancelado={() => router.replace("/mesas")}
    />
  );
}