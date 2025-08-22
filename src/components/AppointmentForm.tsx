import React, { useState } from "react";
import styled from "styled-components/native";
import { Button, Input, Text } from "react-native-elements";
import { Platform, View, TouchableOpacity } from "react-native";
import theme from "../styles/theme";
import { Doctor } from "../types/doctors";
import { Appointment } from "../types/appointments";

// Lista fixa de médicos disponíveis para seleção
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

// Propriedades esperadas pelo formulário de agendamento
type AppointmentFormProps = {
  onSubmit: (appointment: {
    doctorId: string;
    date: Date;
    time: string;
    description: string;
  }) => void;
};

// Função para gerar os horários disponíveis (de 9h às 18h, de meia em meia hora)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

// Componente principal do formulário de agendamento
const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit }) => {
  // Estado para armazenar o médico selecionado
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  // Estado para armazenar a data digitada
  const [dateInput, setDateInput] = useState("");
  // Estado para armazenar o horário selecionado
  const [selectedTime, setSelectedTime] = useState<string>("");
  // Estado para armazenar a descrição da consulta
  const [description, setDescription] = useState("");
  // Lista de horários disponíveis
  const timeSlots = generateTimeSlots();

  // Função para validar se a data está no formato correto e dentro do período permitido
  const validateDate = (inputDate: string) => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = inputDate.match(dateRegex);

    if (!match) return false;

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3));

    return date >= today && date <= maxDate;
  };

  // Função para formatar a data enquanto o usuário digita
  const handleDateChange = (text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, "");

    // Formata a data enquanto digita
    let formattedDate = "";
    if (numbers.length > 0) {
      if (numbers.length <= 2) {
        formattedDate = numbers;
      } else if (numbers.length <= 4) {
        formattedDate = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
        formattedDate = `${numbers.slice(0, 2)}/${numbers.slice(
          2,
          4
        )}/${numbers.slice(4, 8)}`;
      }
    }

    setDateInput(formattedDate);
  };

  // Função chamada ao enviar o formulário
  const handleSubmit = () => {
    // Valida se todos os campos obrigatórios foram preenchidos
    if (!selectedDoctor || !selectedTime || !description) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    // Valida se a data está correta
    if (!validateDate(dateInput)) {
      alert("Por favor, insira uma data válida (DD/MM/AAAA)");
      return;
    }

    // Converte a data para o formato Date
    const [day, month, year] = dateInput.split("/");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Chama a função de submit recebida por props
    onSubmit({
      doctorId: selectedDoctor,
      date,
      time: selectedTime,
      description,
    });
  };

  // Função para verificar se o horário está disponível (pode ser expandida)
  const isTimeSlotAvailable = (time: string) => {
    // Aqui você pode adicionar lógica para verificar se o horário está disponível
    // Por exemplo, verificar se já existe uma consulta agendada para este horário
    return true;
  };

  return (
    <Container>
      {/* Seleção do médico */}
      <Title>Selecione o Médico</Title>
      <DoctorList>
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            selected={selectedDoctor === doctor.id}
            onPress={() => setSelectedDoctor(doctor.id)}
          >
            <DoctorImage source={{ uri: doctor.image }} />
            <DoctorInfo>
              <DoctorName>{doctor.name}</DoctorName>
              <DoctorSpecialty>{doctor.specialty}</DoctorSpecialty>
            </DoctorInfo>
          </DoctorCard>
        ))}
      </DoctorList>

      {/* Campo para data */}
      <Title>Data e Hora</Title>
      <Input
        placeholder="Data (DD/MM/AAAA)"
        value={dateInput}
        onChangeText={handleDateChange}
        keyboardType="numeric"
        maxLength={10}
        containerStyle={InputContainer}
        errorMessage={
          dateInput && !validateDate(dateInput) ? "Data inválida" : undefined
        }
      />

      {/* Seleção de horário */}
      <TimeSlotsContainer>
        <TimeSlotsTitle>Horários Disponíveis:</TimeSlotsTitle>
        <TimeSlotsGrid>
          {timeSlots.map((time) => {
            const isAvailable = isTimeSlotAvailable(time);
            return (
              <TimeSlotButton
                key={time}
                selected={selectedTime === time}
                disabled={!isAvailable}
                onPress={() => isAvailable && setSelectedTime(time)}
              >
                <TimeSlotText
                  selected={selectedTime === time}
                  disabled={!isAvailable}
                >
                  {time}
                </TimeSlotText>
              </TimeSlotButton>
            );
          })}
        </TimeSlotsGrid>
      </TimeSlotsContainer>

      {/* Campo para descrição da consulta */}
      <Input
        placeholder="Descrição da consulta"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        containerStyle={InputContainer}
      />

      {/* Botão para enviar/agendar consulta */}
      <SubmitButton
        title="Agendar Consulta"
        onPress={handleSubmit}
        buttonStyle={{
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          padding: 12,
          marginTop: 20,
        }}
      />
    </Container>
  );
};

// Estilização do container principal do formulário
const Container = styled.View`
  padding: ${theme.spacing.medium}px;
`;

// Estilização do título das seções
const Title = styled.Text`
  font-size: ${theme.typography.subtitle.fontSize}px;
  font-weight: ${theme.typography.subtitle.fontWeight};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.medium}px;
`;

// Lista de médicos rolável
const DoctorList = styled.ScrollView`
  margin-bottom: ${theme.spacing.large}px;
`;

// Card do médico, muda cor se selecionado
const DoctorCard = styled(TouchableOpacity)<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.medium}px;
  background-color: ${(props: { selected: boolean }) =>
    props.selected ? theme.colors.primary : theme.colors.white};
  border-radius: 8px;
  margin-bottom: ${theme.spacing.medium}px;
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

// Container das informações do médico
const DoctorInfo = styled.View`
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
`;

// Container dos horários disponíveis
const TimeSlotsContainer = styled.View`
  margin-bottom: ${theme.spacing.large}px;
`;

// Título dos horários
const TimeSlotsTitle = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.small}px;
`;

// Grid dos botões de horários
const TimeSlotsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.spacing.small}px;
`;

// Botão de horário, muda cor se selecionado ou desabilitado
const TimeSlotButton = styled(TouchableOpacity)<{
  selected: boolean;
  disabled: boolean;
}>`
  background-color: ${(props: { selected: boolean; disabled: boolean }) =>
    props.disabled
      ? theme.colors.background
      : props.selected
      ? theme.colors.primary
      : theme.colors.white};
  padding: ${theme.spacing.small}px ${theme.spacing.medium}px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${(props: { selected: boolean; disabled: boolean }) =>
    props.disabled
      ? theme.colors.background
      : props.selected
      ? theme.colors.primary
      : theme.colors.text};
  opacity: ${(props: { disabled: boolean }) => (props.disabled ? 0.5 : 1)};
`;

// Texto do horário, muda cor se selecionado ou desabilitado
const TimeSlotText = styled(Text)<{ selected: boolean; disabled: boolean }>`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${(props: { selected: boolean; disabled: boolean }) =>
    props.disabled
      ? theme.colors.text
      : props.selected
      ? theme.colors.white
      : theme.colors.text};
`;

// Estilo do container dos inputs
const InputContainer = {
  marginBottom: theme.spacing.medium,
  backgroundColor: theme.colors.white,
  borderRadius: 8,
  paddingHorizontal: theme.spacing.medium,
};

// Botão de submit do formulário
const SubmitButton = styled(Button)`
  margin-top: ${theme.spacing.large}px;
`;

export default AppointmentForm;
