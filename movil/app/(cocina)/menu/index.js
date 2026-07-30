import { useRouter } from "expo-router";
import CocinaMenuScreen from "../../../src/screens/CocinaMenuScreen";

export default function Menu() {
  const router = useRouter();

  const handleEditar = (producto) => {
    router.push(`/menu/editar-producto?id=${producto.id}`);
  };

  return (
    <CocinaMenuScreen
      onNuevoProducto={() => router.push("/menu/nuevo-producto")}
      onEditarProducto={handleEditar}
    />
  );
}