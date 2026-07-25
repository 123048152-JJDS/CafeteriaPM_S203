import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import BotonPrimario from '../components/BotonPrimario'

export default function CajaPerfilScreen({ onLogout }) {
  const [nombre, setNombre] = useState('Juan Fernández')
  const [usuario, setUsuario] = useState('juan.fernandez')
  const [email, setEmail] = useState('juan@cafe.com')

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Mi perfil</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          <Text style={styles.label}>ID Empleado</Text>
          <TextInput style={styles.input} value="CAJ-001" editable={false} />
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
          <BotonPrimario titulo="Guardar cambios" onPress={() => {}} />
          <BotonPrimario titulo="Cerrar sesión" color="#c62828" onPress={onLogout} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B2A41', padding: 20 },
  content: { paddingHorizontal: 24, gap: 8, paddingBottom: 24 },
  label: { fontSize: 14, color: '#5C6F88', marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#DDE5EE',
    borderRadius: 10, paddingVertical: 12,
    paddingHorizontal: 16, fontSize: 15, marginBottom: 8,
  },
})