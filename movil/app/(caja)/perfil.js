import { useRouter } from "expo-router";
import CajaPerfilScreen from "../../src/screens/CajaPerfilScreen";
import { useAuth } from "../../src/context/AuthContext";

export default function Perfil() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };

  return <CajaPerfilScreen onLogout={handleLogout} />;
}