import { useRouter } from "expo-router";
import CocinaEditarProductoScreen from "../../../src/screens/CocinaEditarProductoScreen";

export default function EditarProducto() {
  const router = useRouter();

  const handleGuardar = (_datos) => {
    // Paso 8: PATCH /productos/{id}
    router.back();
  };

  const handleEliminar = (_id) => {
    // Paso 8: DELETE /productos/{id}
    router.back();
  };

  return <CocinaEditarProductoScreen onGuardar={handleGuardar} onEliminar={handleEliminar} />;
}