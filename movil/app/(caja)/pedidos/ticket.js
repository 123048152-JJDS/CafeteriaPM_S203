import { useRouter } from "expo-router";
import CajaTicketScreen from "../../../src/screens/CajaTicketScreen";

export default function Ticket() {
  const router = useRouter();
  return <CajaTicketScreen onIrAPedidos={() => router.dismissAll()} />;
}