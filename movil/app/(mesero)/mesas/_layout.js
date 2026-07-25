import { Stack } from "expo-router";
import { PedidoEnCursoProvider } from "../../../src/context/PedidoEnCursoContext";

export default function MesasStackLayout() {
  return (
    <PedidoEnCursoProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PedidoEnCursoProvider>
  );
}