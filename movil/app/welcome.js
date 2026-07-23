import { useRouter } from "expo-router";
import WelcomeScreen from "../src/screens/WelcomeScreen";

export default function Welcome() {
  const router = useRouter();
  return <WelcomeScreen onIniciarSesion={() => router.push("/login")} />;
}