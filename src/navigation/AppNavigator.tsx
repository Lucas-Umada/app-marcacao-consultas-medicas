import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../types/navigation";

// Importação das telas (screens) utilizadas nas rotas
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateAppointmentScreen from "../screens/CreateAppointmentScreen/index";
import ProfileScreen from "../screens/ProfileScreen/index";
import EditProfileScreen from "../screens/EditProfileScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import DoctorDashboardScreen from "../screens/DoctorDashboardScreen";
import PatientDashboardScreen from "../screens/PatientDashboardScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Cria o stack navigator tipado
const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente principal de navegação da aplicação
export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth(); // Obtém usuário e estado de carregamento do contexto de autenticação

  // Se estiver carregando, não renderiza nada (pode ser substituído por um componente de loading)
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Esconde o cabeçalho padrão das telas
        }}
      >
        {/* Se não houver usuário autenticado, exibe rotas públicas */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Se houver usuário autenticado, exibe rotas protegidas conforme o papel (role)
          <>
            {/* Rota exclusiva para administradores */}
            {user.role === "admin" && (
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: "Painel Administrativo" }}
              />
            )}

            {/* Rota exclusiva para médicos */}
            {user.role === "doctor" && (
              <Stack.Screen
                name="DoctorDashboard"
                component={DoctorDashboardScreen}
                options={{ title: "Painel do Médico" }}
              />
            )}

            {/* Rota exclusiva para pacientes */}
            {user.role === "patient" && (
              <Stack.Screen
                name="PatientDashboard"
                component={PatientDashboardScreen}
                options={{ title: "Painel do Paciente" }}
              />
            )}

            {/* Rotas comuns para todos os usuários autenticados */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Início" }}
            />
            <Stack.Screen
              name="CreateAppointment"
              component={CreateAppointmentScreen}
              options={{ title: "Agendar Consulta" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Perfil" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: "Editar Perfil" }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: "Notificações" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Configurações" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
