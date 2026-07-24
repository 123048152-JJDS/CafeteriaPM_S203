import { useRouter } from "expo-router";
import CocinaPedidosScreen from "../../../src/screens/CocinaPedidosScreen";

export default function Cola() {
  const router = useRouter();
  return (
    <CocinaPedidosScreen
      onVerDetalle={(pedido) => router.push(`/cola/detalle?pedido=${pedido}`)}
    />
  );
}