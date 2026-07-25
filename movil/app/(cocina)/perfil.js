import { useRouter } from "expo-router";
import CocinaPerfilScreen from "../../src/screens/CocinaPerfilScreen";

export default function Perfil() {
  const router = useRouter();

  const handleLogout = () => {
    // Paso 8: aquí llamaremos a useAuth().logout() y limpiaremos el token real
    router.replace("/welcome");
  };

  return <CocinaPerfilScreen onLogout={handleLogout} />;
}