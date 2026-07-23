import { useRouter } from "expo-router";
import MeseroPedidoResumenScreen from "../../../src/screens/MeseroPedidoResumenScreen";

export default function Resumen() {
  const router = useRouter();
  return (
    <MeseroPedidoResumenScreen
      onCancelar={() => router.back()}
      onEnviarACaja={() => router.push("/pedidos")}
    />
  );
}