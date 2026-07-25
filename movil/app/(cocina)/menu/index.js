import { useRouter } from "expo-router";
import CocinaMenuScreen from "../../../src/screens/CocinaMenuScreen";

export default function Menu() {
  const router = useRouter();

  const handleEditar = (producto) => {
    const params = new URLSearchParams({
      id: String(producto.id),
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
    }).toString();
    router.push(`/menu/editar-producto?${params}`);
  };

  return (
    <CocinaMenuScreen
      onNuevoProducto={() => router.push("/menu/nuevo-producto")}
      onEditarProducto={handleEditar}
    />
  );
}