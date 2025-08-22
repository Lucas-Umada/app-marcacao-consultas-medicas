import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipagem genérica para dados armazenados
export interface StorageData {
  [key: string]: any;
}

// Tipagem para itens do cache em memória
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

// Cache em memória para melhorar performance nas leituras
const cache = new Map<string, CacheItem<any>>();

// Chaves de armazenamento centralizadas para facilitar manutenção
export const STORAGE_KEYS = {
  USER: "@MedicalApp:user",
  TOKEN: "@MedicalApp:token",
  APPOINTMENTS: "@MedicalApp:appointments",
  NOTIFICATIONS: "@MedicalApp:notifications",
  REGISTERED_USERS: "@MedicalApp:registeredUsers",
  APP_SETTINGS: "@MedicalApp:settings",
  STATISTICS_CACHE: "@MedicalApp:statisticsCache",
} as const;

export const storageService = {
  // Salva um item no AsyncStorage e atualiza o cache em memória
  async setItem<T>(
    key: string,
    value: T,
    expiryMinutes?: number
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);

      // Atualiza o cache em memória
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiry: expiryMinutes
          ? Date.now() + expiryMinutes * 60 * 1000
          : undefined,
      };
      cache.set(key, cacheItem);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  },

  // Busca um item do cache ou do AsyncStorage
  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      // Verifica se existe no cache e se não expirou
      const cached = cache.get(key);
      if (cached) {
        if (!cached.expiry || cached.expiry > Date.now()) {
          return cached.data as T;
        } else {
          // Remove do cache se expirou
          cache.delete(key);
        }
      }

      // Busca no AsyncStorage
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;

        // Adiciona ao cache
        cache.set(key, {
          data: parsed,
          timestamp: Date.now(),
        });

        return parsed;
      }

      return defaultValue || null;
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      return defaultValue || null;
    }
  },

  // Remove um item do AsyncStorage e do cache
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      cache.delete(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
      throw error;
    }
  },

  // Limpa todo o AsyncStorage e o cache em memória
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      cache.clear();
    } catch (error) {
      console.error("Erro ao limpar armazenamento:", error);
      throw error;
    }
  },

  // Operações específicas para consultas
  async getAppointments(): Promise<any[]> {
    return await this.getItem(STORAGE_KEYS.APPOINTMENTS, []);
  },

  async saveAppointments(appointments: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
  },

  async addAppointment(appointment: any): Promise<void> {
    const appointments = await this.getAppointments();
    appointments.push(appointment);
    await this.saveAppointments(appointments);
  },

  async updateAppointment(
    appointmentId: string,
    updates: Partial<any>
  ): Promise<void> {
    const appointments = await this.getAppointments();
    const updatedAppointments = appointments.map((apt) =>
      apt.id === appointmentId ? { ...apt, ...updates } : apt
    );
    await this.saveAppointments(updatedAppointments);
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    const appointments = await this.getAppointments();
    const filteredAppointments = appointments.filter(
      (apt) => apt.id !== appointmentId
    );
    await this.saveAppointments(filteredAppointments);
  },

  // Operações para usuários registrados
  async getRegisteredUsers(): Promise<any[]> {
    return await this.getItem(STORAGE_KEYS.REGISTERED_USERS, []);
  },

  async saveRegisteredUsers(users: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.REGISTERED_USERS, users);
  },

  async addUser(user: any): Promise<void> {
    const users = await this.getRegisteredUsers();
    users.push(user);
    await this.saveRegisteredUsers(users);
  },

  // Operações para notificações
  async getNotifications(): Promise<any[]> {
    return await this.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  async saveNotifications(notifications: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  async addNotification(notification: any): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.push(notification);
    await this.saveNotifications(notifications);
  },

  // Cria backup dos dados principais do app
  async createBackup(): Promise<string> {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          appointments: await this.getItem(STORAGE_KEYS.APPOINTMENTS, []),
          notifications: await this.getItem(STORAGE_KEYS.NOTIFICATIONS, []),
          registeredUsers: await this.getItem(
            STORAGE_KEYS.REGISTERED_USERS,
            []
          ),
          settings: await this.getItem(STORAGE_KEYS.APP_SETTINGS, {}),
        },
      };
      return JSON.stringify(backup);
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      throw error;
    }
  },

  // Restaura dados a partir de um backup
  async restoreFromBackup(backupString: string): Promise<void> {
    try {
      const backup = JSON.parse(backupString);

      if (backup.data) {
        await this.setItem(
          STORAGE_KEYS.APPOINTMENTS,
          backup.data.appointments || []
        );
        await this.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          backup.data.notifications || []
        );
        await this.setItem(
          STORAGE_KEYS.REGISTERED_USERS,
          backup.data.registeredUsers || []
        );
        await this.setItem(
          STORAGE_KEYS.APP_SETTINGS,
          backup.data.settings || {}
        );
      }
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      throw error;
    }
  },

  // Validação de dados de consulta
  validateAppointment(appointment: any): boolean {
    return (
      appointment &&
      typeof appointment.id === "string" &&
      typeof appointment.patientId === "string" &&
      typeof appointment.doctorId === "string" &&
      typeof appointment.date === "string" &&
      typeof appointment.time === "string" &&
      ["pending", "confirmed", "cancelled"].includes(appointment.status)
    );
  },

  // Validação de dados de usuário
  validateUser(user: any): boolean {
    return (
      user &&
      typeof user.id === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      ["admin", "doctor", "patient"].includes(user.role)
    );
  },

  // Limpa apenas o cache em memória
  clearCache(): void {
    cache.clear();
  },

  // Retorna informações sobre o armazenamento e cache
  async getStorageInfo(): Promise<{
    cacheSize: number;
    totalKeys: number;
    lastAccess: { [key: string]: number };
  }> {
    const allKeys = await AsyncStorage.getAllKeys();
    const lastAccess: { [key: string]: number } = {};

    cache.forEach((value, key) => {
      lastAccess[key] = value.timestamp;
    });

    return {
      cacheSize: cache.size,
      totalKeys: allKeys.length,
      lastAccess,
    };
  },

  // Operações para configurações da aplicação
  async getAppSettings(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.APP_SETTINGS, {
      theme: "light",
      notifications: true,
      language: "pt-BR",
      autoBackup: true,
    });
  },

  async updateAppSettings(settings: Partial<any>): Promise<void> {
    const currentSettings = await this.getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
  },
};
