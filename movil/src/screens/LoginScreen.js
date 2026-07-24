import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native'
import BotonPrimario from '../components/BotonPrimario'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Text style={styles.titulo}>Acceder</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="mesero@cafe.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* onLogin por ahora solo navega; en el Paso 8 lo conectamos a POST /auth/login */}
        <BotonPrimario titulo="Iniciar sesión" onPress={() => onLogin({ email, password })} />
        <Text style={styles.footerText}>Rol: Mesero / Caja / Cocina</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F3864',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 8,
  },
})