import { useRouter } from "expo-router";
import LoginScreen from "../src/screens/LoginScreen";

export default function Login() {
  const router = useRouter();
  // Paso 8: aquí sustituimos handleLogin por un POST real a /auth/login
  const handleLogin = (_credenciales) => {
    router.push("/seleccion-modulo");
  };
  return <LoginScreen onLogin={handleLogin} />;
}