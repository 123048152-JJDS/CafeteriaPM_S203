import { useRouter } from "expo-router";
import CajaPagosScreen from "../../../src/screens/CajaPagosScreen";

export default function Pagos() {
  const router = useRouter();
  return <CajaPagosScreen onPagar={() => router.push("/pedidos/ticket")} />;
}