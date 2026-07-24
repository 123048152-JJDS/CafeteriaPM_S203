import { useRouter } from "expo-router";
import MeseroMesasScreen from "../../../src/screens/MeseroMesasScreen";

export default function Mesas() {
  const router = useRouter();
  return (
    <MeseroMesasScreen
      onSeleccionarMesa={(mesaId) => router.push(`/mesas/detalle?mesaId=${mesaId}`)}
    />
  );
}