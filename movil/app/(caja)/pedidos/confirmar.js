import { useRouter } from "expo-router";
import CajaConfirmarPedidoScreen from "../../../src/screens/CajaConfirmarPedidoScreen";

export default function Confirmar() {
  const router = useRouter();
  return (
    <CajaConfirmarPedidoScreen
      onModificar={() => router.back()}
      onConfirmarCobro={() => router.push("/pedidos/pagos")}
    />
  );
}