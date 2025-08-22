import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { Button, Icon } from "react-native-elements";
import { FontAwesome } from "@expo/vector-icons";
import { HeaderContainer, HeaderTitle } from "../components/Header";
import theme from "../styles/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment } from "../types/appointments";
import { Doctor } from "../types/doctors";
import { RootStackParamList } from "../types/navigation";
import { useFocusEffect } from "@react-navigation/native";

// Tipagem das props da tela principal
type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

// Lista fixa de médicos para exibição das informações
const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. João Silva",
    specialty: "Cardiologista",
    image: "https://mighty.tools/mockmind-api/content/human/91.jpg",
  },
  {
    id: "2",
    name: "Dra. Maria Santos",
    specialty: "Dermatologista",
    image: "https://mighty.tools/mockmind-api/content/human/97.jpg",
  },
  {
    id: "3",
    name: "Dr. Pedro Oliveira",
    specialty: "Oftalmologista",
    image: "https://mighty.tools/mockmind-api/content/human/79.jpg",
  },
];

// Componente principal da tela inicial
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Estado das consultas agendadas
  const [refreshing, setRefreshing] = useState(false); // Estado de carregamento do refresh

  // Função para carregar consultas do AsyncStorage
  const loadAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem("appointments");
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    }
  };

  // Carrega consultas sempre que a tela volta ao foco
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  // Função chamada ao puxar para atualizar a lista
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  // Busca informações do médico pelo id
  const getDoctorInfo = (doctorId: string): Doctor | undefined => {
    return doctors.find((doctor) => doctor.id === doctorId);
  };

  // Renderiza cada consulta agendada
  const renderAppointment = ({ item }: { item: Appointment }) => {
    const doctor = getDoctorInfo(item.doctorId);

    return (
      <AppointmentCard>
        {/* Imagem do médico */}
        <DoctorImage
          source={{ uri: doctor?.image || "https://via.placeholder.com/100" }}
        />
        <InfoContainer>
          {/* Nome e especialidade do médico */}
          <DoctorName>{doctor?.name || "Médico não encontrado"}</DoctorName>
          <DoctorSpecialty>
            {doctor?.specialty || "Especialidade não encontrada"}
          </DoctorSpecialty>
          {/* Data e horário da consulta */}
          <DateTime>
            {new Date(item.date).toLocaleDateString()} - {item.time}
          </DateTime>
          {/* Descrição da consulta */}
          <Description>{item.description}</Description>
          {/* Status da consulta */}
          <Status status={item.status}>
            {item.status === "pending" ? "Pendente" : "Confirmado"}
          </Status>
          {/* Botões de ação para editar ou excluir consulta */}
          <ActionButtons>
            <ActionButton>
              <Icon
                name="edit"
                type="material"
                size={20}
                color={theme.colors.primary}
              />
            </ActionButton>
            <ActionButton>
              <Icon
                name="delete"
                type="material"
                size={20}
                color={theme.colors.error}
              />
            </ActionButton>
          </ActionButtons>
        </InfoContainer>
      </AppointmentCard>
    );
  };

  return (
    <Container>
      {/* Cabeçalho da tela */}
      <HeaderContainer>
        <HeaderTitle>Minhas Consultas</HeaderTitle>
      </HeaderContainer>

      <Content>
        {/* Botão para agendar nova consulta */}
        <Button
          title="Agendar Nova Consulta"
          icon={
            <FontAwesome
              name="calendar-plus-o"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
          }
          buttonStyle={{
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            padding: 12,
            marginBottom: theme.spacing.medium,
          }}
          onPress={() => navigation.navigate("CreateAppointment")}
        />

        {/* Lista de consultas agendadas */}
        <AppointmentList
          data={appointments}
          keyExtractor={(item: Appointment) => item.id}
          renderItem={renderAppointment}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={<EmptyText>Nenhuma consulta agendada</EmptyText>}
        />
      </Content>
    </Container>
  );
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Container do conteúdo principal
const Content = styled.View`
  flex: 1;
  padding: ${theme.spacing.medium}px;
`;

// Lista de consultas agendadas
const AppointmentList = styled(FlatList)`
  flex: 1;
`;

// Card de cada consulta
const AppointmentCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: ${theme.spacing.medium}px;
  margin-bottom: ${theme.spacing.medium}px;
  flex-direction: row;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

// Imagem do médico
const DoctorImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: ${theme.spacing.medium}px;
`;

// Container das informações da consulta
const InfoContainer = styled.View`
  flex: 1;
`;

// Nome do médico
const DoctorName = styled.Text`
  font-size: ${theme.typography.subtitle.fontSize}px;
  font-weight: ${theme.typography.subtitle.fontWeight};
  color: ${theme.colors.text};
`;

// Especialidade do médico
const DoctorSpecialty = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  opacity: 0.8;
  margin-bottom: 4px;
`;

// Data e horário da consulta
const DateTime = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.primary};
  margin-top: 4px;
`;

// Descrição da consulta
const Description = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  opacity: 0.8;
  margin-top: 4px;
`;

// Status da consulta (pendente ou confirmado)
const Status = styled.Text<{ status: string }>`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${(props: { status: string }) =>
    props.status === "pending" ? theme.colors.error : theme.colors.success};
  margin-top: 4px;
  font-weight: bold;
`;

// Container dos botões de ação
const ActionButtons = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${theme.spacing.small}px;
`;

// Botão de ação (editar/excluir)
const ActionButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.small}px;
  margin-left: ${theme.spacing.small}px;
`;

// Texto exibido quando não há consultas agendadas
const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  opacity: 0.6;
  margin-top: ${theme.spacing.large}px;
`;

export default HomeScreen;
