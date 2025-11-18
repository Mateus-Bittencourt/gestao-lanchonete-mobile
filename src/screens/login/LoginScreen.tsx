import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  function onLogin() {
    // Placeholder: lógica de autenticação futura (Firebase).
    if (user.trim() && pass.trim()) {
      navigation.replace('Sales');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={user}
        onChangeText={setUser}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={pass}
        onChangeText={setPass}
      />
      <Button title="Entrar" onPress={onLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f7f7f7' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  }
});

export default LoginScreen;