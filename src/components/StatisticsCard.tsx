import React from "react";
import styled from "styled-components/native";
import { ViewStyle } from "react-native";
import theme from "../styles/theme";

// Propriedades esperadas pelo componente StatisticsCard
interface StatisticsCardProps {
  title: string; // Título do card (ex: "Consultas")
  value: string | number; // Valor principal exibido (ex: 12)
  subtitle?: string; // Texto secundário (opcional)
  color?: string; // Cor personalizada para destaque (opcional)
  icon?: React.ReactNode; // Ícone exibido ao lado do título (opcional)
  style?: ViewStyle; // Estilo adicional para o card (opcional)
}

// Componente principal do card de estatísticas
const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  color = theme.colors.primary, // Cor padrão se não for informada
  icon,
  style,
}) => {
  return (
    <Container style={style} color={color}>
      <Header>
        {/* Exibe ícone se for passado via props */}
        {icon && <IconContainer>{icon}</IconContainer>}
        <Title>{title}</Title>
      </Header>
      {/* Valor principal do card */}
      <Value color={color}>{value}</Value>
      {/* Exibe subtítulo se existir */}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Container>
  );
};

// Estilização do container principal do card
const Container = styled.View<{ color: string }>`
  background-color: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  margin: 8px;
  min-height: 120px;
  justify-content: space-between;
  border-left-width: 4px;
  border-left-color: ${(props) => props.color}; // Borda colorida à esquerda
  shadow-color: ${theme.colors.text};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

// Área do título e ícone
const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

// Container do ícone
const IconContainer = styled.View`
  margin-right: 8px;
`;

// Título do card
const Title = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  font-weight: 500;
  opacity: 0.8;
`;

// Valor principal do card, com cor personalizada
const Value = styled.Text<{ color: string }>`
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.color};
  margin-bottom: 4px;
`;

// Subtítulo do card
const Subtitle = styled.Text`
  font-size: 12px;
  color: ${theme.colors.text};
  opacity: 0.6;
`;

export default StatisticsCard;
