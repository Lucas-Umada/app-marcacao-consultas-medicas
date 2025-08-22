import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import CreateAppointmentScreen from "../screens/CreateAppointmentScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Cria o stack navigator para gerenciar as rotas da aplicação
const Stack = createNativeStackNavigator();

// Componente principal que define as rotas privadas do app
export default function AppRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho padrão das telas
        animation: "slide_from_right", // Animação de transição entre telas
      }}
    >
      {/* Tela inicial do usuário autenticado */}
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Tela para agendar uma nova consulta */}
      <Stack.Screen
        name="CreateAppointment"
        component={CreateAppointmentScreen}
      />
      {/* Tela de perfil do usuário */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
