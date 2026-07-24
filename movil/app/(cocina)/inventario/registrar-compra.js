import { useRouter } from "expo-router";
import CocinaRegistrarCompraScreen from "../../../src/screens/CocinaRegistrarCompraScreen";

export default function RegistrarCompra() {
  const router = useRouter();
  return <CocinaRegistrarCompraScreen onGuardar={() => router.back()} />;
}