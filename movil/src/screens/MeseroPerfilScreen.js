import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native'
import BotonPrimario from '../components/BotonPrimario'
import { useAuth } from '../context/AuthContext'

export default function MeseroPerfilScreen({ onLogout }) {
  const { auth, actualizarPerfil } = useAuth()
  const [nombre, setNombre] = useState(auth?.nombre || '')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Nombre inválido', 'El nombre no puede estar vacío')
      return
    }
    if (nuevaPassword && nuevaPassword.length < 6) {
      Alert.alert('Contraseña inválida', 'Debe tener al menos 6 caracteres')
      return
    }
    setGuardando(true)
    try {
      await actualizarPerfil({ nombre: nombre.trim(), password: nuevaPassword || undefined })
      setNuevaPassword('')
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente')
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Mi perfil</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          <Text style={styles.label}>ID Empleado</Text>
          <TextInput style={styles.input} value={String(auth?.userId ?? '')} editable={false} />
          <Text style={styles.label}>Rol</Text>
          <TextInput style={styles.input} value={auth?.rol ?? ''} editable={false} />
          <Text style={styles.label}>Nueva contraseña (opcional)</Text>
          <TextInput
            style={styles.input}
            value={nuevaPassword}
            onChangeText={setNuevaPassword}
            secureTextEntry
            placeholder="Dejar vacío para no cambiar"
          />
          {guardando ? (
            <ActivityIndicator color="#1F3864" style={{ marginVertical: 8 }} />
          ) : (
            <BotonPrimario titulo="Guardar cambios" onPress={handleGuardar} />
          )}
          <BotonPrimario titulo="Cerrar sesión" color="#c62828" onPress={onLogout} disabled={guardando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { paddingHorizontal: 24, gap: 8, paddingBottom: 24 },
  label: { fontSize: 14, color: '#555555' },
  input: { borderWidth: 1, borderColor: '#dddddd', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, fontSize: 15, marginBottom: 8 },
})