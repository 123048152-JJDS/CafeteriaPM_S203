import { useRouter } from "expo-router";
import LoginScreen from "../src/screens/LoginScreen";
import { useAuth } from "../src/context/AuthContext";

const ROL_A_RUTA = {
  mesero: "/mesas",
  caja: "/pedidos",
  cocina: "/cola",
};

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    const auth = await login(email, password);
    const ruta = ROL_A_RUTA[auth.rol];
    if (!ruta) {
      throw new Error("Este rol no tiene acceso a la app móvil");
    }
    router.replace(ruta);
  };

  return <LoginScreen onLogin={handleLogin} />;
}