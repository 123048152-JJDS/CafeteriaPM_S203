import { useRouter } from "expo-router";
import CocinaMenuScreen from "../../../src/screens/CocinaMenuScreen";

export default function Menu() {
  const router = useRouter();
  return (
    <CocinaMenuScreen onNuevoProducto={() => router.push("/menu/nuevo-producto")} />
  );
}