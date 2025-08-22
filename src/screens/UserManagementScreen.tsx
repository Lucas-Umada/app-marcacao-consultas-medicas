import React, { useState } from "react";
import styled from "styled-components/native";
import { ScrollView, ViewStyle, TextStyle } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import theme from "../styles/theme";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipagem das props da tela de gerenciamento de usuários
type UserManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserManagement">;
};

// Tipagem de um usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
}

// Tipagem para estilização condicional do badge de papel
interface StyledProps {
  role: string;
}

// Componente principal da tela de gerenciamento de usuários
const UserManagementScreen: React.FC = () => {
  const { user } = useAuth(); // Obtém usuário autenticado do contexto
  const navigation = useNavigation<UserManagementScreenProps["navigation"]>(); // Hook de navegação
  const [users, setUsers] = useState<User[]>([]); // Estado da lista de usuários
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função para carregar usuários do AsyncStorage
  const loadUsers = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem("@MedicalApp:users");
      if (storedUsers) {
        const allUsers: User[] = JSON.parse(storedUsers);
        // Filtra o usuário atual da lista para não exibir ele mesmo
        const filteredUsers = allUsers.filter((u) => u.id !== user?.id);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir um usuário
  const handleDeleteUser = async (userId: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem("@MedicalApp:users");
      if (storedUsers) {
        const allUsers: User[] = JSON.parse(storedUsers);
        const updatedUsers = allUsers.filter((u) => u.id !== userId);
        await AsyncStorage.setItem(
          "@MedicalApp:users",
          JSON.stringify(updatedUsers)
        );
        loadUsers(); // Recarrega a lista após exclusão
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  // Carrega os usuários quando a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

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
        <Title>Gerenciar Usuários</Title>

        {/* Botão para adicionar novo usuário */}
        <Button
          title="Adicionar Novo Usuário"
          onPress={() => {}}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Exibe carregamento, lista ou mensagem de vazio */}
        {loading ? (
          <LoadingText>Carregando usuários...</LoadingText>
        ) : users.length === 0 ? (
          <EmptyText>Nenhum usuário cadastrado</EmptyText>
        ) : (
          users.map((user) => (
            <UserCard key={user.id}>
              <ListItem.Content>
                {/* Nome do usuário */}
                <ListItem.Title style={styles.userName as TextStyle}>
                  {user.name}
                </ListItem.Title>
                {/* Email do usuário */}
                <ListItem.Subtitle style={styles.userEmail as TextStyle}>
                  {user.email}
                </ListItem.Subtitle>
                {/* Badge com o papel do usuário */}
                <RoleBadge role={user.role}>
                  <RoleText role={user.role}>{getRoleText(user.role)}</RoleText>
                </RoleBadge>
                {/* Botões de ação para editar ou excluir usuário */}
                <ButtonContainer>
                  <Button
                    title="Editar"
                    onPress={() => {}}
                    containerStyle={styles.actionButton as ViewStyle}
                    buttonStyle={styles.editButton}
                  />
                  <Button
                    title="Excluir"
                    onPress={() => handleDeleteUser(user.id)}
                    containerStyle={styles.actionButton as ViewStyle}
                    buttonStyle={styles.deleteButton}
                  />
                </ButtonContainer>
              </ListItem.Content>
            </UserCard>
          ))
        )}

        {/* Botão para voltar */}
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.backButton}
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
  backButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  actionButton: {
    marginTop: 8,
    width: "48%",
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Título principal da tela
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

// Card de cada usuário
const UserCard = styled(ListItem)`
  background-color: ${theme.colors.background};
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 15px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

// Texto de carregamento
const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Texto exibido quando não há usuários
const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Badge que exibe o papel do usuário
const RoleBadge = styled.View<StyledProps>`
  background-color: ${(props: StyledProps) => {
    switch (props.role) {
      case "admin":
        return theme.colors.primary + "20";
      case "doctor":
        return theme.colors.success + "20";
      default:
        return theme.colors.secondary + "20";
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

// Texto do badge de papel
const RoleText = styled.Text<StyledProps>`
  color: ${(props: StyledProps) => {
    switch (props.role) {
      case "admin":
        return theme.colors.primary;
      case "doctor":
        return theme.colors.success;
      default:
        return theme.colors.secondary;
    }
  }};
  font-size: 12px;
  font-weight: 500;
`;

// Container dos botões de ação
const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

export default UserManagementScreen;
