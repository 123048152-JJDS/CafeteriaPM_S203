import { useRouter } from "expo-router";
import MeseroDetalleMesaScreen from "../../../src/screens/MeseroDetalleMesaScreen";

export default function Detalle() {
  const router = useRouter();
  return (
    <MeseroDetalleMesaScreen
      onAgregarPedido={() => router.push("/mesas/catalogo")}
      onLiberar={() => router.back()}
    />
  );
}