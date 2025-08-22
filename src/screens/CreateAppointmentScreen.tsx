import React, { useState } from "react";
import styled from "styled-components/native";
import { ScrollView, ViewStyle } from "react-native";
import { Button, Input } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import theme from "../styles/theme";
import Header from "../components/Header";
import DoctorList from "../components/DoctorList";
import TimeSlotList from "../components/TimeSlotList";
import { notificationService } from "../services/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipagem das props da tela de agendamento
type CreateAppointmentScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "CreateAppointment"
  >;
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

// Tipagem de um médico
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

// Lista de médicos disponíveis
const availableDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. João Silva",
    specialty: "Cardiologia",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    name: "Dra. Maria Santos",
    specialty: "Pediatria",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "3",
    name: "Dr. Pedro Oliveira",
    specialty: "Ortopedia",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "4",
    name: "Dra. Ana Costa",
    specialty: "Dermatologia",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "5",
    name: "Dr. Carlos Mendes",
    specialty: "Oftalmologia",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

// Componente principal da tela de agendamento de consulta
const CreateAppointmentScreen: React.FC = () => {
  const { user } = useAuth(); // Obtém usuário autenticado do contexto
  const navigation =
    useNavigation<CreateAppointmentScreenProps["navigation"]>(); // Hook de navegação
  const [date, setDate] = useState(""); // Estado para data da consulta
  const [selectedTime, setSelectedTime] = useState<string>(""); // Estado para horário selecionado
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null); // Estado para médico selecionado
  const [loading, setLoading] = useState(false); // Estado de carregamento do botão
  const [error, setError] = useState(""); // Estado para mensagem de erro

  // Função para criar/agendar uma nova consulta
  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      // Valida se todos os campos obrigatórios foram preenchidos
      if (!date || !selectedTime || !selectedDoctor) {
        setError("Por favor, preencha a data e selecione um médico e horário");
        return;
      }

      // Recupera consultas existentes do armazenamento
      const storedAppointments = await AsyncStorage.getItem(
        "@MedicalApp:appointments"
      );
      const appointments: Appointment[] = storedAppointments
        ? JSON.parse(storedAppointments)
        : [];

      // Cria nova consulta
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: user?.id || "",
        patientName: user?.name || "",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        time: selectedTime,
        specialty: selectedDoctor.specialty,
        status: "pending",
      };

      // Adiciona nova consulta à lista
      appointments.push(newAppointment);

      // Salva lista atualizada no armazenamento
      await AsyncStorage.setItem(
        "@MedicalApp:appointments",
        JSON.stringify(appointments)
      );

      // Envia notificação para o médico sobre a nova consulta
      await notificationService.notifyNewAppointment(
        selectedDoctor.id,
        newAppointment
      );

      alert("Consulta agendada com sucesso!");
      navigation.goBack(); // Volta para tela anterior
    } catch (err) {
      setError("Erro ao agendar consulta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título da tela */}
        <Title>Agendar Consulta</Title>

        {/* Campo para digitar a data */}
        <Input
          placeholder="Data (DD/MM/AAAA)"
          value={date}
          onChangeText={setDate}
          containerStyle={styles.input}
          keyboardType="numeric"
        />

        {/* Seção para seleção de horário */}
        <SectionTitle>Selecione um Horário</SectionTitle>
        <TimeSlotList
          onSelectTime={setSelectedTime}
          selectedTime={selectedTime}
        />

        {/* Seção para seleção de médico */}
        <SectionTitle>Selecione um Médico</SectionTitle>
        <DoctorList
          doctors={availableDoctors}
          onSelectDoctor={setSelectedDoctor}
          selectedDoctorId={selectedDoctor?.id}
        />

        {/* Exibe mensagem de erro se houver */}
        {error ? <ErrorText>{error}</ErrorText> : null}

        {/* Botão para agendar consulta */}
        <Button
          title="Agendar"
          onPress={handleCreateAppointment}
          loading={loading}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para cancelar e voltar */}
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.cancelButton}
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
  cancelButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
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
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 10px;
  margin-top: 10px;
`;

// Texto de erro exibido abaixo dos campos
const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default CreateAppointmentScreen;
