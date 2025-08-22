import React, { useState } from "react";
import styled from "styled-components/native";
import { ScrollView, ViewStyle, Alert } from "react-native";
import { Button, ListItem, Badge } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import theme from "../styles/theme";
import Header from "../components/Header";
import { notificationService, Notification } from "../services/notifications";

// Tipagem das props da tela de notificações
type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Notifications">;
};

// Componente principal da tela de notificações
const NotificationsScreen: React.FC = () => {
  const { user } = useAuth(); // Obtém usuário autenticado do contexto
  const navigation = useNavigation<NotificationsScreenProps["navigation"]>(); // Hook de navegação
  const [notifications, setNotifications] = useState<Notification[]>([]); // Estado das notificações
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função para carregar notificações do usuário
  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const userNotifications = await notificationService.getNotifications(
        user.id
      );
      setNotifications(userNotifications); // Atualiza estado com notificações
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega notificações sempre que a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [user?.id])
  );

  // Marca uma notificação como lida
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications(); // Recarrega notificações após marcar como lida
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Marca todas as notificações como lidas
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      loadNotifications(); // Recarrega notificações após marcar todas como lidas
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  // Exclui uma notificação após confirmação do usuário
  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      "Excluir Notificação",
      "Tem certeza que deseja excluir esta notificação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              loadNotifications(); // Recarrega notificações após exclusão
            } catch (error) {
              console.error("Erro ao excluir notificação:", error);
            }
          },
        },
      ]
    );
  };

  // Retorna ícone conforme o tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
        return "✅";
      case "appointment_cancelled":
        return "❌";
      case "appointment_reminder":
        return "⏰";
      default:
        return "📩";
    }
  };

  // Formata a data da notificação para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Conta notificações não lidas
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título da tela e badge de notificações não lidas */}
        <TitleContainer>
          <Title>Notificações</Title>
          {unreadCount > 0 && (
            <Badge
              value={unreadCount}
              status="error"
              containerStyle={styles.badge}
            />
          )}
        </TitleContainer>

        {/* Botão para marcar todas como lidas */}
        {unreadCount > 0 && (
          <Button
            title="Marcar todas como lidas"
            onPress={handleMarkAllAsRead}
            containerStyle={styles.markAllButton as ViewStyle}
            buttonStyle={styles.markAllButtonStyle}
          />
        )}

        {/* Botão para voltar */}
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Exibe carregamento, lista ou mensagem de vazio */}
        {loading ? (
          <LoadingText>Carregando notificações...</LoadingText>
        ) : notifications.length === 0 ? (
          <EmptyContainer>
            <EmptyText>Nenhuma notificação encontrada</EmptyText>
          </EmptyContainer>
        ) : (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} isRead={notification.read}>
              <ListItem
                onPress={() =>
                  !notification.read && handleMarkAsRead(notification.id)
                } // Marca como lida ao clicar
                onLongPress={() => handleDeleteNotification(notification.id)} // Exclui ao pressionar por tempo
              >
                <NotificationIcon>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <ListItem.Content>
                  <NotificationHeader>
                    <ListItem.Title style={styles.title}>
                      {notification.title}
                    </ListItem.Title>
                    {!notification.read && <UnreadDot />}
                  </NotificationHeader>
                  <ListItem.Subtitle style={styles.message}>
                    {notification.message}
                  </ListItem.Subtitle>
                  <DateText>{formatDate(notification.createdAt)}</DateText>
                </ListItem.Content>
              </ListItem>
            </NotificationCard>
          ))
        )}
      </ScrollView>
    </Container>
  );
};

// Estilos para os componentes da tela
const styles = {
  scrollContent: {
    padding: 20,
  },
  badge: {
    marginLeft: 8,
  },
  markAllButton: {
    marginBottom: 15,
    width: "100%",
  },
  markAllButtonStyle: {
    backgroundColor: theme.colors.success,
    paddingVertical: 10,
  },
  button: {
    marginBottom: 20,
    width: "100%",
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Container do título e badge
const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

// Título da tela
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  text-align: center;
`;

// Texto de carregamento
const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Container exibido quando não há notificações
const EmptyContainer = styled.View`
  align-items: center;
  margin-top: 40px;
`;

// Texto exibido quando não há notificações
const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  opacity: 0.7;
`;

// Card de cada notificação, muda cor se lida ou não
const NotificationCard = styled.View<{ isRead: boolean }>`
  background-color: ${(props) =>
    props.isRead ? theme.colors.white : theme.colors.primary + "10"};
  border-radius: 8px;
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${(props) =>
    props.isRead ? theme.colors.border : theme.colors.primary + "30"};
`;

// Ícone da notificação
const NotificationIcon = styled.Text`
  font-size: 20px;
  margin-right: 8px;
`;

// Cabeçalho da notificação (título + ponto de não lida)
const NotificationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

// Ponto vermelho para indicar não lida
const UnreadDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${theme.colors.error};
  margin-left: 8px;
`;

// Data da notificação
const DateText = styled.Text`
  font-size: 12px;
  color: ${theme.colors.text};
  opacity: 0.6;
  margin-top: 4px;
`;

export default NotificationsScreen;
