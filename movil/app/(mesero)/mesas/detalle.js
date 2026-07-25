import { useRouter } from "expo-router";
import MeseroDetalleMesaScreen from "../../../src/screens/MeseroDetalleMesaScreen";

export default function Detalle() {
  const router = useRouter();
  return (
    <MeseroDetalleMesaScreen
      onAgregarPedido={(mesaId) => router.push(`/mesas/catalogo?mesaId=${mesaId}`)}
      onLiberar={() => router.replace("/mesas")}
    />
  );
}