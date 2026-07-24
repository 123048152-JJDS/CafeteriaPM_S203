import { useRouter } from "expo-router";
import MeseroPedidoCatalogoScreen from "../../../src/screens/MeseroPedidoCatalogoScreen";

export default function Catalogo() {
  const router = useRouter();
  return (
    <MeseroPedidoCatalogoScreen onVerResumen={() => router.push("/mesas/resumen")} />
  );
}