import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipagem da notificação
export interface Notification {
  id: string; // Identificador único da notificação
  userId: string; // ID do usuário destinatário
  title: string; // Título da notificação
  message: string; // Mensagem da notificação
  type:
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "appointment_reminder"
    | "general"; // Tipo da notificação
  read: boolean; // Indica se a notificação foi lida
  createdAt: string; // Data de criação
  appointmentId?: string; // ID da consulta relacionada (opcional)
}

const STORAGE_KEY = "@MedicalApp:notifications"; // Chave de armazenamento das notificações

export const notificationService = {
  // Busca todas as notificações do usuário, ordenadas por data (mais recentes primeiro)
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      return allNotifications
        .filter((n) => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      return [];
    }
  },

  // Cria uma nova notificação para um usuário
  async createNotification(
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(), // Gera ID único baseado no timestamp
        createdAt: new Date().toISOString(), // Data atual
        read: false, // Nova notificação começa como não lida
      };

      allNotifications.push(newNotification);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }
  },

  // Marca uma notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

      const updatedNotifications = allNotifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  },

  // Marca todas as notificações de um usuário como lidas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

      const updatedNotifications = allNotifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
    }
  },

  // Exclui uma notificação pelo ID
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

      const filteredNotifications = allNotifications.filter(
        (n) => n.id !== notificationId
      );
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filteredNotifications)
      );
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  },

  // Retorna a quantidade de notificações não lidas do usuário
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getNotifications(userId);
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error("Erro ao contar notificações não lidas:", error);
      return 0;
    }
  },

  // Notificações específicas para eventos do sistema

  // Notifica paciente sobre confirmação de consulta
  async notifyAppointmentConfirmed(
    patientId: string,
    appointmentDetails: any
  ): Promise<void> {
    await this.createNotification({
      userId: patientId,
      type: "appointment_confirmed",
      title: "Consulta Confirmada",
      message: `Sua consulta com ${appointmentDetails.doctorName} foi confirmada para ${appointmentDetails.date} às ${appointmentDetails.time}.`,
      appointmentId: appointmentDetails.id,
    });
  },

  // Notifica paciente sobre cancelamento de consulta (com motivo opcional)
  async notifyAppointmentCancelled(
    patientId: string,
    appointmentDetails: any,
    reason?: string
  ): Promise<void> {
    await this.createNotification({
      userId: patientId,
      type: "appointment_cancelled",
      title: "Consulta Cancelada",
      message: `Sua consulta com ${
        appointmentDetails.doctorName
      } foi cancelada.${reason ? ` Motivo: ${reason}` : ""}`,
      appointmentId: appointmentDetails.id,
    });
  },

  // Notifica médico sobre novo agendamento de consulta
  async notifyNewAppointment(
    doctorId: string,
    appointmentDetails: any
  ): Promise<void> {
    await this.createNotification({
      userId: doctorId,
      type: "general",
      title: "Nova Consulta Agendada",
      message: `${appointmentDetails.patientName} agendou uma consulta para ${appointmentDetails.date} às ${appointmentDetails.time}.`,
      appointmentId: appointmentDetails.id,
    });
  },

  // Notifica usuário sobre lembrete de consulta
  async notifyAppointmentReminder(
    userId: string,
    appointmentDetails: any
  ): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: "appointment_reminder",
      title: "Lembrete de Consulta",
      message: `Você tem uma consulta agendada para amanhã às ${
        appointmentDetails.time
      } com ${
        appointmentDetails.doctorName || appointmentDetails.patientName
      }.`,
      appointmentId: appointmentDetails.id,
    });
  },
};
