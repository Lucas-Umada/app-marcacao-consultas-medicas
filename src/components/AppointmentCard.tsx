import React from "react";
import styled from "styled-components/native";
import { ViewStyle } from "react-native";
import { Card, Text, Avatar } from "react-native-elements";
import theme from "../styles/theme";

// Propriedades esperadas pelo componente AppointmentCard
interface AppointmentCardProps {
  doctorName: string; // Nome do médico
  date: string; // Data da consulta
  time: string; // Horário da consulta
  specialty: string; // Especialidade do médico
  status: "pending" | "confirmed" | "cancelled"; // Status da consulta
  onPress?: () => void; // Função chamada ao pressionar o card (opcional)
  style?: ViewStyle; // Estilo adicional para o card (opcional)
}

// Componente principal do card de consulta
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctorName,
  date,
  time,
  specialty,
  status,
  onPress,
  style,
}) => {
  // Função para definir a cor do status conforme o tipo
  const getStatusColor = () => {
    switch (status) {
      case "confirmed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Card containerStyle={[styles.card, style]}>
      <CardContent>
        {/* Informações do médico */}
        <DoctorInfo>
          <Avatar
            size="medium"
            rounded
            source={{
              uri: `https://randomuser.me/api/portraits/men/${Math.floor(
                Math.random() * 10
              )}.jpg`,
            }}
            containerStyle={styles.avatar}
          />
          <TextContainer>
            <DoctorName>{doctorName}</DoctorName>
            <Specialty>{specialty}</Specialty>
          </TextContainer>
        </DoctorInfo>

        {/* Informações da consulta */}
        <AppointmentInfo>
          <InfoRow>
            <InfoLabel>Data:</InfoLabel>
            <InfoValue>{date}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Horário:</InfoLabel>
            <InfoValue>{time}</InfoValue>
          </InfoRow>
        </AppointmentInfo>

        {/* Status da consulta */}
        <StatusContainer>
          <StatusDot color={getStatusColor()} />
          <StatusText color={getStatusColor()}>
            {status === "confirmed"
              ? "Confirmada"
              : status === "cancelled"
              ? "Cancelada"
              : "Pendente"}
          </StatusText>
        </StatusContainer>
      </CardContent>
    </Card>
  );
};

// Estilos para o card e avatar
const styles = {
  card: {
    borderRadius: 10,
    marginHorizontal: 0,
    marginVertical: 8,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
};

// Estilização dos componentes usando styled-components
const CardContent = styled.View`
  padding: 10px;
`;

const DoctorInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const TextContainer = styled.View`
  margin-left: 15px;
`;

const DoctorName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
`;

const Specialty = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const AppointmentInfo = styled.View`
  margin-bottom: 15px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  marginbottom: 5px;
`;

const InfoLabel = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const InfoValue = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  font-weight: 500;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const StatusDot = styled.View<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`;

const StatusText = styled.Text<{ color: string }>`
  font-size: 14px;
  color: ${(props) => props.color};
  font-weight: 500;
`;

export default AppointmentCard;
