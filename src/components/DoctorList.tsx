import React from "react";
import styled from "styled-components/native";
import { ViewStyle } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import theme from "../styles/theme";

// Interface que define as propriedades de um médico
interface Doctor {
  id: string; // Identificador único do médico
  name: string; // Nome do médico
  specialty: string; // Especialidade do médico
  image: string; // URL da imagem do médico
}

// Propriedades esperadas pelo componente DoctorList
interface DoctorListProps {
  doctors: Doctor[]; // Lista de médicos a ser exibida
  onSelectDoctor: (doctor: Doctor) => void; // Função chamada ao selecionar um médico
  selectedDoctorId?: string; // ID do médico selecionado (opcional)
  style?: ViewStyle; // Estilo adicional para o container (opcional)
}

// Componente principal que exibe a lista de médicos
const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  onSelectDoctor,
  selectedDoctorId,
  style,
}) => {
  return (
    <Container style={style}>
      {/* Renderiza cada médico como um ListItem */}
      {doctors.map((doctor) => (
        <ListItem
          key={doctor.id}
          onPress={() => onSelectDoctor(doctor)} // Chama a função ao clicar no item
          containerStyle={[
            styles.listItem,
            selectedDoctorId === doctor.id && styles.selectedItem, // Aplica estilo se selecionado
          ]}
        >
          {/* Avatar do médico */}
          <Avatar
            size="medium"
            rounded
            source={{ uri: doctor.image }}
            containerStyle={styles.avatar}
          />
          {/* Informações do médico */}
          <ListItem.Content>
            <ListItem.Title style={styles.name}>{doctor.name}</ListItem.Title>
            <ListItem.Subtitle style={styles.specialty}>
              {doctor.specialty}
            </ListItem.Subtitle>
          </ListItem.Content>
          {/* Ícone de seta à direita */}
          <ListItem.Chevron />
        </ListItem>
      ))}
    </Container>
  );
};

// Estilos para os itens da lista e avatar
const styles = {
  listItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedItem: {
    backgroundColor: theme.colors.primary + "20", // Destaque para item selecionado
    borderColor: theme.colors.primary,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
};

// Estilização do container principal da lista
const Container = styled.View`
  margin-bottom: 15px;
`;

export default DoctorList;
