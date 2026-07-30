import { useRouter } from "expo-router";
import CajaModificarPedidoScreen from "../../../src/screens/CajaModificarPedidoScreen";

export default function Modificar() {
  const router = useRouter();

  const handleGuardar = (_productos, _total) => {
    // Paso 8: aquí actualizaríamos el pedido en el backend (PATCH detalle_pedido)
    router.back();
  };

  return <CajaModificarPedidoScreen onGuardar={handleGuardar} onCancelar={() => router.back()} />;
}