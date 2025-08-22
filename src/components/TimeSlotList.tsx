import React from "react";
import styled from "styled-components/native";
import { ViewStyle, TouchableOpacity } from "react-native";
import theme from "../styles/theme";

// Propriedades esperadas pelo componente TimeSlotList
interface TimeSlotListProps {
  onSelectTime: (time: string) => void; // Função chamada ao selecionar um horário
  selectedTime?: string; // Horário selecionado (opcional)
  style?: ViewStyle; // Estilo adicional para o container (opcional)
}

// Propriedades para estilização condicional dos cards de horário
interface StyledProps {
  isSelected: boolean; // Indica se o horário está selecionado
}

// Componente principal que exibe a lista de horários disponíveis
const TimeSlotList: React.FC<TimeSlotListProps> = ({
  onSelectTime,
  selectedTime,
  style,
}) => {
  // Gera horários de 30 em 30 minutos das 9h às 18h
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Container style={style}>
      <TimeGrid>
        {/* Renderiza cada horário como um botão */}
        {timeSlots.map((time) => (
          <TimeCard
            key={time}
            onPress={() => onSelectTime(time)} // Chama função ao selecionar horário
            isSelected={selectedTime === time} // Destaca se estiver selecionado
          >
            <TimeText isSelected={selectedTime === time}>{time}</TimeText>
          </TimeCard>
        ))}
      </TimeGrid>
    </Container>
  );
};

// Container principal da lista de horários
const Container = styled.View`
  margin-bottom: 15px;
`;

// Grid que organiza os horários em linhas e colunas
const TimeGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px;
`;

// Card de horário, muda cor se selecionado
const TimeCard = styled(TouchableOpacity)<StyledProps>`
  width: 23%;
  padding: 8px;
  border-radius: 6px;
  background-color: ${(props: StyledProps) =>
    props.isSelected ? theme.colors.primary + "20" : theme.colors.background};
  border-width: 1px;
  border-color: ${(props: StyledProps) =>
    props.isSelected ? theme.colors.primary : theme.colors.border};
  align-items: center;
  justify-content: center;
`;

// Texto do horário, muda cor se selecionado
const TimeText = styled.Text<StyledProps>`
  font-size: 12px;
  font-weight: 500;
  color: ${(props: StyledProps) =>
    props.isSelected ? theme.colors.primary : theme.colors.text};
`;

export default TimeSlotList;
