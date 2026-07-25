import { useRouter } from "expo-router";
import CajaPerfilScreen from "../../src/screens/CajaPerfilScreen";

export default function Perfil() {
  const router = useRouter();

  const handleLogout = () => {
    // Paso 8: aquí llamaremos a useAuth().logout() y limpiaremos el token real
    router.replace("/welcome");
  };

  return <CajaPerfilScreen onLogout={handleLogout} />;
}