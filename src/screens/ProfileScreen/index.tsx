import React from "react";
import { ViewStyle } from "react-native";
import { Button } from "react-native-elements";

import { useProfile } from "./hooks/useProfile";
import { Container, ScrollView, Title } from "./styles";
import Header from "../../components/Header";
import ProfileCard from "./components/ProfileCard";
import theme from "../../styles/theme";

const ProfileScreen: React.FC = () => {
  const { user, signOut, handleEditProfile, handleGoBack } = useProfile();

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title>Meu Perfil</Title>

        <ProfileCard user={user} />

        <Button
          title="Editar Perfil"
          onPress={handleEditProfile}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.editButton}
        />

        <Button
          title="Voltar"
          onPress={handleGoBack}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

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
  editButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
};

export default ProfileScreen;