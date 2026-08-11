import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "cafeteriapm_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // { token, userId, nombre, rol }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setAuth(JSON.parse(raw));
      setIsLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    // data: { access_token, token_type, user_id, nombre, rol }
    const nuevaAuth = {
      token: data.access_token,
      userId: data.user_id,
      nombre: data.nombre,
      rol: data.rol,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaAuth));
    setAuth(nuevaAuth);
    return nuevaAuth;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  const actualizarPerfil = async ({ nombre, password }) => {
    const payload = {};
    if (nombre !== undefined) payload.nombre = nombre;
    if (password) payload.password = password;

    const actualizado = await api.patch("/usuarios/me", payload, auth?.token);

    const nuevaAuth = { ...auth, nombre: actualizado.nombre };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaAuth));
    setAuth(nuevaAuth);
    return nuevaAuth;
  };

  return (
    <AuthContext.Provider value={{ auth, isLoading, login, logout, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}