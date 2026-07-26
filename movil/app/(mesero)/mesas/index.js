import { useRouter } from "expo-router";
import { Alert } from "react-native";
import MeseroMesasScreen from "../../../src/screens/MeseroMesasScreen";
import { api } from "../../../src/services/api";
import { useAuth } from "../../../src/context/AuthContext";

export default function Mesas() {
  const router = useRouter();
  const { auth } = useAuth();

  const handleSeleccionarMesa = async (mesaId, estado, pedidoActivoId) => {
    if (estado === "disponible") {
      try {
        const res = await api.patch(`/mesas/${mesaId}/ocupar`, {}, auth?.token);
        router.push(`/mesas/catalogo?mesaId=${mesaId}&pedidoId=${res.pedido_id}`);
      } catch (e) {
        Alert.alert("No se pudo ocupar la mesa", e.message);
      }
      return;
    }

    // ocupada o reservada → ver detalle del pedido existente
    router.push(`/mesas/detalle?mesaId=${mesaId}&estado=${estado}&pedidoId=${pedidoActivoId}`);
  };

  return <MeseroMesasScreen onSeleccionarMesa={handleSeleccionarMesa} />;
}