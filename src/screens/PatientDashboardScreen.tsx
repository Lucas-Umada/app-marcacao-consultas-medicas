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

// Tipagem das props da tela do paciente
type PatientDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PatientDashboard">;
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

// Componente principal da tela do painel do paciente
const PatientDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth(); // Obtém usuário autenticado e função de logout
  const navigation = useNavigation<PatientDashboardScreenProps["navigation"]>(); // Hook de navegação
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Estado das consultas do paciente
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função para carregar consultas do paciente do AsyncStorage
  const loadAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem(
        "@MedicalApp:appointments"
      );
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments);
        // Filtra apenas as consultas do paciente logado
        const userAppointments = allAppointments.filter(
          (appointment) => appointment.patientId === user?.id
        );
        setAppointments(userAppointments);
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega as consultas quando a tela estiver em foco
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

        {/* Botão para agendar nova consulta */}
        <Button
          title="Agendar Nova Consulta"
          onPress={() => navigation.navigate("CreateAppointment")}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

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

        {/* Lista de consultas do paciente */}
        {loading ? (
          <LoadingText>Carregando consultas...</LoadingText>
        ) : appointments.length === 0 ? (
          <EmptyText>Nenhuma consulta agendada</EmptyText>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id}>
              <ListItem.Content>
                {/* Nome do paciente */}
                <ListItem.Title style={styles.patientName as TextStyle}>
                  Paciente: {appointment.patientName}
                </ListItem.Title>
                {/* Data e horário da consulta */}
                <ListItem.Subtitle style={styles.dateTime as TextStyle}>
                  {appointment.date} às {appointment.time}
                </ListItem.Subtitle>
                {/* Nome do médico */}
                <Text style={styles.doctorName as TextStyle}>
                  {appointment.doctorName}
                </Text>
                {/* Especialidade do médico */}
                <Text style={styles.specialty as TextStyle}>
                  {appointment.specialty}
                </Text>
                {/* Badge de status da consulta */}
                <StatusBadge status={appointment.status}>
                  <StatusText status={appointment.status}>
                    {getStatusText(appointment.status)}
                  </StatusText>
                </StatusBadge>
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
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  dateTime: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
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

export default PatientDashboardScreen;
