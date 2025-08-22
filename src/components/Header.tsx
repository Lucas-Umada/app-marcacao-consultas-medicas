import React from "react";
import styled from "styled-components/native";
import { Avatar } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import theme from "../styles/theme";

// Componente de cabeçalho que exibe informações do usuário logado e o ícone de notificações
const Header: React.FC = () => {
  // Obtém o usuário autenticado do contexto
  const { user } = useAuth();

  // Se não houver usuário logado, não renderiza nada
  if (!user) return null;

  return (
    <Container>
      {/* Área com avatar e nome do usuário */}
      <UserInfo>
        <Avatar
          size="medium"
          rounded
          source={{ uri: user.image }} // Imagem do usuário
          containerStyle={styles.avatar}
        />
        <TextContainer>
          <WelcomeText>Bem-vindo(a),</WelcomeText>
          <UserName>{user.name}</UserName>
        </TextContainer>
      </UserInfo>
      {/* Ícone de notificações */}
      <NotificationBell />
    </Container>
  );
};

// Estilos para o avatar do usuário
const styles = {
  avatar: {
    backgroundColor: theme.colors.primary,
  },
};

// Estilização do container principal do cabeçalho
const Container = styled.View`
  background-color: ${theme.colors.primary};
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`;

// Área que agrupa avatar e textos do usuário
const UserInfo = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

// Container dos textos de boas-vindas e nome
const TextContainer = styled.View`
  margin-left: 12px;
`;

// Texto de boas-vindas
const WelcomeText = styled.Text`
  font-size: 14px;
  color: ${theme.colors.white};
  opacity: 0.9;
`;

// Texto com o nome do usuário
const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.white};
`;

export default Header;
