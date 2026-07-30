import { useRouter } from "expo-router";
import CocinaPedidosScreen from "../../../src/screens/CocinaPedidosScreen";

export default function Cola() {
  const router = useRouter();
  return (
    <CocinaPedidosScreen
      onVerDetalle={(pedidoId) => router.push(`/cola/detalle?pedidoId=${pedidoId}`)}
    />
  );
}