import { useRouter, useLocalSearchParams } from "expo-router";
import MeseroPedidoCatalogoScreen from "../../../src/screens/MeseroPedidoCatalogoScreen";

export default function Catalogo() {
  const router = useRouter();
  const { mesaId } = useLocalSearchParams();

  return (
    <MeseroPedidoCatalogoScreen
      onVerResumen={() => router.push(`/mesas/resumen?mesaId=${mesaId}`)}
    />
  );
}