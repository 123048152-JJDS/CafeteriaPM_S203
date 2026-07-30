import { useRouter } from "expo-router";
import CocinaPerfilScreen from "../../src/screens/CocinaPerfilScreen";
import { useAuth } from "../../src/context/AuthContext";

export default function Perfil() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };

  return <CocinaPerfilScreen onLogout={handleLogout} />;
}