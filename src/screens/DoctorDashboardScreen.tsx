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
import StatisticsCard from "../components/StatisticsCard";
import AppointmentActionModal from "../components/AppointmentActionModal";
import { statisticsService, Statistics } from "../services/statistics";
import { notificationService } from "../services/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipagem das props da tela do médico
type DoctorDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "DoctorDashboard">;
};

// Tipagem de uma consulta
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: "pending" | "confirmed" | "cancelled";
}

// Tipagem para estilização condicional de status
interface StyledProps {
  status: string;
}

// Função para definir cor do status da consulta
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return theme.colors.success;
    case "cancelled":
      return theme.colors.error;
    default:
      return theme.colors.warning;
  }
};

// Função para retornar texto do status da consulta
const getStatusText = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Cancelada";
    default:
      return "Pendente";
  }
};

// Componente principal da tela do painel do médico
const DoctorDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth(); // Obtém usuário autenticado e função de logout
  const navigation = useNavigation<DoctorDashboardScreenProps["navigation"]>(); // Hook de navegação
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Estado das consultas do médico
  const [statistics, setStatistics] = useState<Partial<Statistics> | null>(
    null
  ); // Estado das estatísticas do médico
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [modalVisible, setModalVisible] = useState(false); // Estado de visibilidade do modal de ação
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null); // Consulta selecionada para ação
  const [actionType, setActionType] = useState<"confirm" | "cancel">("confirm"); // Tipo de ação no modal

  // Função para carregar consultas e estatísticas do médico
  const loadAppointments = async () => {
    try {
      // Carrega todas as consultas do armazenamento e filtra apenas as do médico logado
      const storedAppointments = await AsyncStorage.getItem(
        "@MedicalApp:appointments"
      );
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments);
        const doctorAppointments = allAppointments.filter(
          (appointment) => appointment.doctorId === user?.id
        );
        setAppointments(doctorAppointments);
      }

      // Carrega estatísticas do médico
      if (user?.id) {
        const stats = await statisticsService.getDoctorStatistics(user.id);
        setStatistics(stats);
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abre o modal de ação (confirmar/cancelar) para uma consulta específica
  const handleOpenModal = (
    appointment: Appointment,
    action: "confirm" | "cancel"
  ) => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setModalVisible(true);
  };

  // Fecha o modal de ação
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  // Confirma ou cancela a consulta selecionada e envia notificação ao paciente
  const handleConfirmAction = async (reason?: string) => {
    if (!selectedAppointment) return;

    try {
      const storedAppointments = await AsyncStorage.getItem(
        "@MedicalApp:appointments"
      );
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments);
        const updatedAppointments = allAppointments.map((appointment) => {
          if (appointment.id === selectedAppointment.id) {
            return {
              ...appointment,
              status: actionType === "confirm" ? "confirmed" : "cancelled",
              ...(reason && { cancelReason: reason }), // Adiciona motivo se houver
            };
          }
          return appointment;
        });
        await AsyncStorage.setItem(
          "@MedicalApp:appointments",
          JSON.stringify(updatedAppointments)
        );

        // Envia notificação para o paciente
        if (actionType === "confirm") {
          await notificationService.notifyAppointmentConfirmed(
            selectedAppointment.patientId,
            selectedAppointment
          );
        } else {
          await notificationService.notifyAppointmentCancelled(
            selectedAppointment.patientId,
            selectedAppointment,
            reason
          );
        }

        loadAppointments(); // Recarrega a lista de consultas
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Carrega as consultas e estatísticas sempre que a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título principal da tela */}
        <Title>Minhas Consultas</Title>

        {/* Botão para acessar perfil */}
        <Button
          title="Meu Perfil"
          onPress={() => navigation.navigate("Profile")}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para acessar configurações */}
        <Button
          title="Configurações"
          onPress={() => navigation.navigate("Settings")}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.settingsButton}
        />

        {/* Seção de estatísticas do médico */}
        <SectionTitle>Minhas Estatísticas</SectionTitle>
        {statistics && (
          <StatisticsGrid>
            <StatisticsCard
              title="Total de Consultas"
              value={statistics.totalAppointments || 0}
              color={theme.colors.primary}
              subtitle="Todas as consultas"
            />
            <StatisticsCard
              title="Consultas Confirmadas"
              value={statistics.confirmedAppointments || 0}
              color={theme.colors.success}
              subtitle={`${(
                statistics.statusPercentages?.confirmed || 0
              ).toFixed(1)}% do total`}
            />
            <StatisticsCard
              title="Pacientes Atendidos"
              value={statistics.totalPatients || 0}
              color={theme.colors.secondary}
              subtitle="Pacientes únicos"
            />
            <StatisticsCard
              title="Pendentes"
              value={statistics.pendingAppointments || 0}
              color={theme.colors.warning}
              subtitle="Aguardando confirmação"
            />
          </StatisticsGrid>
        )}

        {/* Seção das consultas do médico */}
        <SectionTitle>Minhas Consultas</SectionTitle>
        {loading ? (
          <LoadingText>Carregando consultas...</LoadingText>
        ) : appointments.length === 0 ? (
          <EmptyText>Nenhuma consulta agendada</EmptyText>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id}>
              <ListItem.Content>
                <ListItem.Title style={styles.patientName as TextStyle}>
                  Paciente: {appointment.patientName || "Nome não disponível"}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.dateTime as TextStyle}>
                  {appointment.date} às {appointment.time}
                </ListItem.Subtitle>
                <Text style={styles.specialty as TextStyle}>
                  {appointment.specialty}
                </Text>
                {/* Badge de status da consulta */}
                <StatusBadge status={appointment.status}>
                  <StatusText status={appointment.status}>
                    {getStatusText(appointment.status)}
                  </StatusText>
                </StatusBadge>
                {/* Botões para confirmar ou cancelar se estiver pendente */}
                {appointment.status === "pending" && (
                  <ButtonContainer>
                    <Button
                      title="Confirmar"
                      onPress={() => handleOpenModal(appointment, "confirm")}
                      containerStyle={styles.actionButton as ViewStyle}
                      buttonStyle={styles.confirmButton}
                    />
                    <Button
                      title="Cancelar"
                      onPress={() => handleOpenModal(appointment, "cancel")}
                      containerStyle={styles.actionButton as ViewStyle}
                      buttonStyle={styles.cancelButton}
                    />
                  </ButtonContainer>
                )}
              </ListItem.Content>
            </AppointmentCard>
          ))
        )}

        {/* Botão para sair/logout */}
        <Button
          title="Sair"
          onPress={signOut}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.logoutButton}
        />

        {/* Modal de ação para confirmar ou cancelar consulta */}
        {selectedAppointment && (
          <AppointmentActionModal
            visible={modalVisible}
            onClose={handleCloseModal}
            onConfirm={handleConfirmAction}
            actionType={actionType}
            appointmentDetails={{
              patientName: selectedAppointment.patientName,
              doctorName: selectedAppointment.doctorName,
              date: selectedAppointment.date,
              time: selectedAppointment.time,
              specialty: selectedAppointment.specialty,
            }}
          />
        )}
      </ScrollView>
    </Container>
  );
};

// Estilos para os componentes e elementos da tela
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
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
  settingsButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  actionButton: {
    marginTop: 8,
    width: "48%",
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 8,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 8,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  specialty: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
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

// Título das seções
const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 15px;
  margin-top: 10px;
`;

// Card de consulta
const AppointmentCard = styled(ListItem)`
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

// Texto exibido quando não há consultas
const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Badge de status da consulta
const StatusBadge = styled.View<StyledProps>`
  background-color: ${(props: StyledProps) =>
    getStatusColor(props.status) + "20"};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

// Texto do status da consulta
const StatusText = styled.Text<StyledProps>`
  color: ${(props: StyledProps) => getStatusColor(props.status)};
  font-size: 12px;
  font-weight: 500;
`;

// Container dos botões de ação da consulta
const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

// Grid de estatísticas
const StatisticsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export default DoctorDashboardScreen;
