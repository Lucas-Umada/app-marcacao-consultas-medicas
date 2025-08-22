import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { TouchableOpacity } from "react-native";
import { Badge } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { notificationService } from "../services/notifications";
import theme from "../styles/theme";

// Componente que exibe o ícone de notificações com badge de quantidade não lida
const NotificationBell: React.FC = () => {
  const { user } = useAuth(); // Obtém usuário autenticado
  const navigation = useNavigation(); // Hook de navegação
  const [unreadCount, setUnreadCount] = useState(0); // Estado para contador de notificações não lidas

  // Função para buscar quantidade de notificações não lidas
  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count); // Atualiza estado com quantidade
    } catch (error) {
      console.error("Erro ao carregar contador de notificações:", error);
    }
  };

  // Carrega contador ao montar e a cada 30 segundos
  useEffect(() => {
    loadUnreadCount();
    // Recarrega o contador a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval); // Limpa intervalo ao desmontar
  }, [user?.id]);

  // Atualiza quando a tela volta ao foco
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadUnreadCount);
    return unsubscribe; // Remove listener ao desmontar
  }, [navigation, user?.id]);

  // Navega para tela de notificações ao clicar no sino
  const handlePress = () => {
    navigation.navigate("Notifications" as never);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <BellContainer>
        <BellIcon>🔔</BellIcon>
        {/* Exibe badge se houver notificações não lidas */}
        {unreadCount > 0 && (
          <Badge
            value={unreadCount > 99 ? "99+" : unreadCount.toString()}
            status="error"
            containerStyle={styles.badge}
            textStyle={styles.badgeText}
          />
        )}
      </BellContainer>
    </TouchableOpacity>
  );
};

// Estilos para o badge de notificações
const styles = {
  badge: {
    position: "absolute" as const,
    top: -8,
    right: -8,
  },
  badgeText: {
    fontSize: 10,
  },
};

// Estilização do container do sino
const BellContainer = styled.View`
  position: relative;
  padding: 8px;
`;

// Estilização do ícone do sino
const BellIcon = styled.Text`
  font-size: 24px;
  color: ${theme.colors.white};
`;

export default NotificationBell;
