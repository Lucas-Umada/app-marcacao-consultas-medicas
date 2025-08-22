import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/auth";
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextData,
} from "../types/auth";

// Chaves de armazenamento utilizadas no AsyncStorage
const STORAGE_KEYS = {
  USER: "@MedicalApp:user",
  TOKEN: "@MedicalApp:token",
};

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provedor do contexto de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null); // Estado do usuário autenticado
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial

  // Carrega usuário e lista de usuários registrados ao montar o componente
  useEffect(() => {
    loadStoredUser();
    loadRegisteredUsers();
  }, []);

  // Carrega usuário armazenado no AsyncStorage
  const loadStoredUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser); // Atualiza estado com usuário recuperado
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false); // Finaliza carregamento
    }
  };

  // Carrega lista de usuários registrados (usado para login e cadastro)
  const loadRegisteredUsers = async () => {
    try {
      await authService.loadRegisteredUsers();
    } catch (error) {
      console.error("Erro ao carregar usuários registrados:", error);
    }
  };

  // Realiza login do usuário
  const signIn = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.signIn(credentials);
      setUser(response.user); // Atualiza estado com usuário autenticado
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.user)
      ); // Salva usuário
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token); // Salva token
    } catch (error) {
      throw error; // Propaga erro para tratamento externo
    }
  };

  // Realiza cadastro de novo usuário
  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user); // Atualiza estado com novo usuário
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.user)
      ); // Salva usuário
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token); // Salva token
    } catch (error) {
      throw error; // Propaga erro para tratamento externo
    }
  };

  // Realiza logout do usuário
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null); // Remove usuário do estado
      await AsyncStorage.removeItem(STORAGE_KEYS.USER); // Remove usuário do armazenamento
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN); // Remove token do armazenamento
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Atualiza dados do usuário autenticado
  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser); // Atualiza estado
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(updatedUser)
      ); // Atualiza armazenamento
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  // Retorna o contexto para os componentes filhos
  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, register, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
