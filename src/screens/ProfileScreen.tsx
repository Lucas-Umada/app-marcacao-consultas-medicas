import React from "react";
import styled from "styled-components/native";
import { Button, ListItem } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import theme from "../styles/theme";
import Header from "../components/Header";
import { ViewStyle } from "react-native";

// Tipagem das props da tela de perfil
type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

// Componente principal da tela de perfil do usuário
const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth(); // Obtém usuário autenticado e função de logout
  const navigation = useNavigation<ProfileScreenProps["navigation"]>(); // Hook de navegação

  // Função para retornar o texto do papel do usuário
  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "doctor":
        return "Médico";
      case "patient":
        return "Paciente";
      default:
        return role;
    }
  };

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título da tela */}
        <Title>Meu Perfil</Title>

        {/* Card com informações do usuário */}
        <ProfileCard>
          {/* Imagem do usuário */}
          <Avatar
            source={{ uri: user?.image || "https://via.placeholder.com/150" }}
          />
          {/* Nome do usuário */}
          <Name>{user?.name}</Name>
          {/* Email do usuário */}
          <Email>{user?.email}</Email>
          {/* Badge com o papel do usuário */}
          <RoleBadge role={user?.role || ""}>
            <RoleText>{getRoleText(user?.role || "")}</RoleText>
          </RoleBadge>
          {/* Exibe especialidade se o usuário for médico */}
          {user?.role === "doctor" && (
            <SpecialtyText>Especialidade: {user?.specialty}</SpecialtyText>
          )}
        </ProfileCard>

        {/* Botão para editar perfil */}
        <Button
          title="Editar Perfil"
          onPress={() => navigation.navigate("EditProfile" as any)}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.editButton}
        />

        {/* Botão para voltar */}
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para sair/logout */}
        <Button
          title="Sair"
          onPress={signOut}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.logoutButton}
        />
      </ScrollView>
    </Container>
  );
};

// Estilos para os componentes da tela
const styles = {
  scrollContent: {
    padding: 20,
  },
  button: {
    marginBottom: 20,
    width: "100%",
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  editButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// ScrollView para rolar o conteúdo
const ScrollView = styled.ScrollView`
  flex: 1;
`;

// Título principal da tela
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

// Card com informações do perfil
const ProfileCard = styled.View`
  background-color: ${theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  align-items: center;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

// Imagem do usuário
const Avatar = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 16px;
`;

// Nome do usuário
const Name = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

// Email do usuário
const Email = styled.Text`
  font-size: 16px;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

// Badge que exibe o papel do usuário
const RoleBadge = styled.View<{ role: string }>`
  background-color: ${(props: { role: string }) => {
    switch (props.role) {
      case "admin":
        return theme.colors.primary + "20";
      case "doctor":
        return theme.colors.success + "20";
      default:
        return theme.colors.secondary + "20";
    }
  }};
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
`;

// Texto do badge de papel
const RoleText = styled.Text`
  color: ${theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

// Texto da especialidade do médico
const SpecialtyText = styled.Text`
  font-size: 16px;
  color: ${theme.colors.text};
  margin-top: 8px;
`;

export default ProfileScreen;
