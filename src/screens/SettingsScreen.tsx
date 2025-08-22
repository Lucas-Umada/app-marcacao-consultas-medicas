import React, { useState } from "react";
import styled from "styled-components/native";
import { ScrollView, ViewStyle, Alert, Share } from "react-native";
import { Button, ListItem, Switch, Text } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import theme from "../styles/theme";
import Header from "../components/Header";
import { storageService } from "../services/storage";

// Tipagem das props da tela de configurações
type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

// Tipagem das configurações do app
interface AppSettings {
  notifications: boolean; // Receber notificações push
  autoBackup: boolean; // Backup automático
  theme: "light" | "dark"; // Tema do app
  language: string; // Idioma
}

// Componente principal da tela de configurações
const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth(); // Obtém usuário autenticado e função de logout
  const navigation = useNavigation<SettingsScreenProps["navigation"]>(); // Hook de navegação

  // Estado das configurações do app
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    autoBackup: true,
    theme: "light",
    language: "pt-BR",
  });
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [storageInfo, setStorageInfo] = useState<any>(null); // Informações de armazenamento

  // Carrega configurações e informações de armazenamento ao focar na tela
  const loadSettings = async () => {
    try {
      const appSettings = await storageService.getAppSettings();
      setSettings(appSettings);

      const info = await storageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  // Atualiza uma configuração específica
  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await storageService.updateAppSettings({ [key]: value });
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      Alert.alert("Erro", "Não foi possível salvar a configuração");
    }
  };

  // Cria backup dos dados e compartilha
  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const backup = await storageService.createBackup();

      const fileName = `backup_${new Date().toISOString().split("T")[0]}.json`;

      await Share.share({
        message: backup,
        title: `Backup do App - ${fileName}`,
      });

      Alert.alert("Sucesso", "Backup criado e compartilhado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      Alert.alert("Erro", "Não foi possível criar o backup");
    } finally {
      setLoading(false);
    }
  };

  // Limpa o cache da aplicação
  const handleClearCache = async () => {
    Alert.alert(
      "Limpar Cache",
      "Isso irá limpar o cache da aplicação. Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              storageService.clearCache();
              await loadSettings();
              Alert.alert("Sucesso", "Cache limpo com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar o cache");
            }
          },
        },
      ]
    );
  };

  // Apaga todos os dados da aplicação (ação perigosa)
  const handleClearAllData = async () => {
    Alert.alert(
      "Apagar Todos os Dados",
      "ATENÇÃO: Isso irá apagar TODOS os dados da aplicação permanentemente. Esta ação não pode ser desfeita!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "APAGAR TUDO",
          style: "destructive",
          onPress: async () => {
            Alert.alert(
              "Confirmação Final",
              "Tem certeza absoluta? Todos os dados serão perdidos!",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "SIM, APAGAR",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await storageService.clearAll();
                      Alert.alert(
                        "Concluído",
                        "Todos os dados foram apagados. O app será reiniciado.",
                        [{ text: "OK", onPress: () => signOut() }]
                      );
                    } catch (error) {
                      Alert.alert("Erro", "Não foi possível apagar os dados");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Exibe tela de carregamento enquanto busca configurações
  if (loading) {
    return (
      <Container>
        <Header />
        <LoadingContainer>
          <LoadingText>Carregando configurações...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título da tela */}
        <Title>Configurações</Title>

        {/* Seção de preferências */}
        <SectionTitle>Preferências</SectionTitle>
        <SettingsCard>
          {/* Switch para notificações */}
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Notificações</ListItem.Title>
              <ListItem.Subtitle>Receber notificações push</ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting("notifications", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </ListItem>

          {/* Switch para backup automático */}
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Backup Automático</ListItem.Title>
              <ListItem.Subtitle>
                Criar backups automaticamente
              </ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.autoBackup}
              onValueChange={(value) => updateSetting("autoBackup", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </ListItem>
        </SettingsCard>

        {/* Seção de dados e armazenamento */}
        <SectionTitle>Dados e Armazenamento</SectionTitle>
        <SettingsCard>
          {storageInfo && (
            <>
              {/* Exibe quantidade de itens no cache */}
              <InfoItem>
                <InfoLabel>Itens no Cache:</InfoLabel>
                <InfoValue>{storageInfo.cacheSize}</InfoValue>
              </InfoItem>
              {/* Exibe total de chaves armazenadas */}
              <InfoItem>
                <InfoLabel>Total de Chaves:</InfoLabel>
                <InfoValue>{storageInfo.totalKeys}</InfoValue>
              </InfoItem>
            </>
          )}
        </SettingsCard>

        {/* Botão para criar backup */}
        <Button
          title="Criar Backup"
          onPress={handleCreateBackup}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.backupButton}
          loading={loading}
        />

        {/* Botão para limpar cache */}
        <Button
          title="Limpar Cache"
          onPress={handleClearCache}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.cacheButton}
        />

        {/* Seção de ações perigosas */}
        <SectionTitle>Ações Perigosas</SectionTitle>
        {/* Botão para apagar todos os dados */}
        <Button
          title="Apagar Todos os Dados"
          onPress={handleClearAllData}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.dangerButton}
        />

        {/* Botão para voltar */}
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
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
  button: {
    marginBottom: 15,
    width: "100%",
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  backupButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
  },
  cacheButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: 12,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Container de carregamento
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Texto de carregamento
const LoadingText = styled.Text`
  font-size: 16px;
  color: ${theme.colors.text};
`;

// Título da tela
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
  margin-top: 20px;
`;

// Card das configurações
const SettingsCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  margin-bottom: 15px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

// Item de informação de armazenamento
const InfoItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`;

// Label do item de informação
const InfoLabel = styled.Text`
  font-size: 16px;
  color: ${theme.colors.text};
`;

// Valor do item de informação
const InfoValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${theme.colors.primary};
`;

export default SettingsScreen;
