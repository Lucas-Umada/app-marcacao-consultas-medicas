import React, { useState } from "react";
import styled from "styled-components/native";
import { Input, Button, Text } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import theme from "../styles/theme";
import { ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

// Tipagem das props da tela de cadastro
type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

// Componente principal da tela de cadastro de paciente
const RegisterScreen: React.FC = () => {
  const { register } = useAuth(); // Função de cadastro do contexto de autenticação
  const navigation = useNavigation<RegisterScreenProps["navigation"]>(); // Hook de navegação
  // Estados para os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carregamento do botão
  const [error, setError] = useState(""); // Estado para mensagem de erro

  // Função chamada ao clicar no botão de cadastro
  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      // Validação dos campos obrigatórios
      if (!name || !email || !password) {
        setError("Por favor, preencha todos os campos");
        return;
      }

      // Tenta cadastrar o usuário
      await register({
        name,
        email,
        password,
      });

      // Após o registro bem-sucedido, navega para o login
      navigation.navigate("Login");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Título da tela */}
      <Title>Cadastro de Paciente</Title>

      {/* Campo para nome completo */}
      <Input
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={styles.input}
      />

      {/* Campo para email */}
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />

      {/* Campo para senha */}
      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      {/* Exibe mensagem de erro se houver */}
      {error ? <ErrorText>{error}</ErrorText> : null}

      {/* Botão para cadastrar */}
      <Button
        title="Cadastrar"
        onPress={handleRegister}
        loading={loading}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.buttonStyle}
      />

      {/* Botão para voltar para tela de login */}
      <Button
        title="Voltar para Login"
        onPress={() => navigation.navigate("Login")}
        containerStyle={styles.backButton as ViewStyle}
        buttonStyle={styles.backButtonStyle}
      />
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
  backButton: {
    marginTop: 10,
    width: "100%",
  },
  backButtonStyle: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: ${theme.colors.background};
`;

// Título da tela
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

export default RegisterScreen;
