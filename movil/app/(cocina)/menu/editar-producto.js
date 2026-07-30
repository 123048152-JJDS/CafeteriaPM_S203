import { useRouter } from "expo-router";
import CocinaEditarProductoScreen from "../../../src/screens/CocinaEditarProductoScreen";

export default function EditarProducto() {
  const router = useRouter();
  return (
    <CocinaEditarProductoScreen
      onGuardado={() => router.back()}
      onEliminado={() => router.back()}
    />
  );
}