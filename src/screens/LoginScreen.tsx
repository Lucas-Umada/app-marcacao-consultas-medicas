import React, { useState } from "react";
import styled from "styled-components/native";
import { Input, Button, Text } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import theme from "../styles/theme";
import { ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

// Tipagem das props da tela de login
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

// Componente principal da tela de login
const LoginScreen: React.FC = () => {
  const { signIn } = useAuth(); // Função de login do contexto de autenticação
  const navigation = useNavigation<LoginScreenProps["navigation"]>(); // Hook de navegação
  const [email, setEmail] = useState(""); // Estado do campo de email
  const [password, setPassword] = useState(""); // Estado do campo de senha
  const [loading, setLoading] = useState(false); // Estado de carregamento do botão
  const [error, setError] = useState(""); // Estado para mensagem de erro

  // Função chamada ao clicar no botão de login
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signIn({ email, password }); // Tenta autenticar usuário
    } catch (err) {
      setError("Email ou senha inválidos"); // Exibe erro se falhar
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Título do app */}
      <Title>App Marcação de Consultas</Title>

      {/* Campo de email */}
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />

      {/* Campo de senha */}
      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      {/* Exibe mensagem de erro se houver */}
      {error ? <ErrorText>{error}</ErrorText> : null}

      {/* Botão para entrar/login */}
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.buttonStyle}
      />

      {/* Botão para navegar para cadastro de novo paciente */}
      <Button
        title="Cadastrar Novo Paciente"
        onPress={() => navigation.navigate("Register")}
        containerStyle={styles.registerButton as ViewStyle}
        buttonStyle={styles.registerButtonStyle}
      />

      {/* Dica de credenciais de exemplo */}
      <Text style={styles.hint}>Use as credenciais de exemplo:</Text>
      <Text style={styles.credentials}>
        Admin: admin@example.com / 123456{"\n"}
        Médicos: joao@example.com, maria@example.com, pedro@example.com / 123456
      </Text>
    </Container>
  );
};

// Estilos para os componentes da tela
const styles = {
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    width: "100%",
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  registerButton: {
    marginTop: 10,
    width: "100%",
  },
  registerButtonStyle: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  hint: {
    marginTop: 20,
    textAlign: "center" as const,
    color: theme.colors.text,
  },
  credentials: {
    marginTop: 10,
    textAlign: "center" as const,
    color: theme.colors.text,
    fontSize: 12,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: ${theme.colors.background};
`;

// Título do app
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: ${theme.colors.text};
`;

// Texto de erro exibido abaixo dos campos
const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default LoginScreen;
