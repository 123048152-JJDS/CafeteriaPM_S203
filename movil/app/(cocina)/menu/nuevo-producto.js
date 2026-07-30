import { useRouter } from "expo-router";
import CocinaNuevoProductoScreen from "../../../src/screens/CocinaNuevoProductoScreen";

export default function NuevoProducto() {
  const router = useRouter();
  return <CocinaNuevoProductoScreen onGuardado={() => router.back()} />;
}