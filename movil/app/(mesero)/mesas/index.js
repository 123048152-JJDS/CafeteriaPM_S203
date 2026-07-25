import { useRouter } from "expo-router";
import MeseroMesasScreen from "../../../src/screens/MeseroMesasScreen";

export default function Mesas() {
  const router = useRouter();

  const handleSeleccionarMesa = (mesaId, estado) => {
    if (estado === "libre") {
      // Mesa sin pedido activo → arrancar uno nuevo directo en el catálogo
      router.push(`/mesas/catalogo?mesaId=${mesaId}`);
    } else {
      // Ocupada o reservada → ver el estado/pedido existente primero
      router.push(`/mesas/detalle?mesaId=${mesaId}&estado=${estado}`);
    }
  };

  return <MeseroMesasScreen onSeleccionarMesa={handleSeleccionarMesa} />;
}