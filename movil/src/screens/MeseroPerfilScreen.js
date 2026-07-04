import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Button
} from 'react-native'
import MeseroNavbar from '../components/MeseroNavbar'
import BotonPrimario from '../components/BotonPrimario'

export default function MeseroPerfilScreen({ setScreen }) {
  const [nombre, setNombre] = useState('Ana García')
  const [usuario, setUsuario] = useState('ana.garcia')
  const [email, setEmail] = useState('ana@cafe.com')

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Mi perfil</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          <Text style={styles.label}>ID Empleado</Text>
          <TextInput style={styles.input} value="MES-001" editable={false} />
          <Text style={styles.label}>Usuario</Text>
          <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <BotonPrimario titulo="Guardar cambios" />
        </ScrollView>
      </KeyboardAvoidingView>
      <MeseroNavbar activo="perfil" />
      <Button title="← Regresar al menú" onPress={() => setScreen('menu')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F3864', padding: 20 },
  content: { paddingHorizontal: 24, gap: 8, paddingBottom: 24 },
  label: { fontSize: 14, color: '#555555' },
  input: {
    borderWidth: 1, borderColor: '#dddddd',
    borderRadius: 10, paddingVertical: 12,
    paddingHorizontal: 16, fontSize: 15, marginBottom: 8,
  },
})