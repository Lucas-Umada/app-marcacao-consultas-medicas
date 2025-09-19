import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipagem de uma consulta
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Tipagem das estatísticas retornadas
export interface Statistics {
  totalAppointments: number; // Total de consultas
  confirmedAppointments: number; // Consultas confirmadas
  pendingAppointments: number; // Consultas pendentes
  cancelledAppointments: number; // Consultas canceladas
  totalPatients: number; // Total de pacientes únicos
  totalDoctors: number; // Total de médicos únicos
  specialties: { [key: string]: number }; // Quantidade de consultas por especialidade
  appointmentsByMonth: { [key: string]: number }; // Consultas por mês
  statusPercentages: {
    confirmed: number;
    pending: number;
    cancelled: number;
  }; // Percentual de cada status
}

// Serviço de estatísticas da aplicação
export const statisticsService = {
  // Estatísticas gerais do sistema (admin)
  async getGeneralStatistics(): Promise<Statistics> {
    try {
      // Busca todas as consultas do armazenamento
      const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
      const appointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
      
      // Busca todos os usuários registrados
      const registeredUsersData = await AsyncStorage.getItem('@MedicalApp:registeredUsers');
      const registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];

      // Estatísticas básicas
      const totalAppointments = appointments.length;
      const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
      const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
      const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

      // Contagem de pacientes únicos
      const uniquePatients = new Set(appointments.map(a => a.patientId));
      const totalPatients = uniquePatients.size;

      // Contagem de médicos únicos
      const uniqueDoctors = new Set(appointments.map(a => a.doctorId));
      const totalDoctors = uniqueDoctors.size;

      // Contagem de consultas por especialidade
      const specialties: { [key: string]: number } = {};
      appointments.forEach(appointment => {
        if (specialties[appointment.specialty]) {
          specialties[appointment.specialty]++;
        } else {
          specialties[appointment.specialty] = 1;
        }
      });

      // Consultas agrupadas por mês/ano
      const appointmentsByMonth: { [key: string]: number } = {};
      appointments.forEach(appointment => {
        try {
          const [day, month, year] = appointment.date.split('/');
          const monthKey = `${month}/${year}`;
          if (appointmentsByMonth[monthKey]) {
            appointmentsByMonth[monthKey]++;
          } else {
            appointmentsByMonth[monthKey] = 1;
          }
        } catch (error) {
          console.warn('Data inválida encontrada:', appointment.date);
        }
      });

      // Percentuais de cada status
      const statusPercentages = {
        confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
        pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
        cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
      };

      // Retorna objeto com todas as estatísticas
      return {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalPatients,
        totalDoctors,
        specialties,
        appointmentsByMonth,
        statusPercentages,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  },

  // Estatísticas específicas de um médico
  async getDoctorStatistics(doctorId: string): Promise<Partial<Statistics>> {
    try {
      // Busca todas as consultas do armazenamento
      const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
      const allAppointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
      
      // Filtra apenas consultas do médico informado
      const doctorAppointments = allAppointments.filter(a => a.doctorId === doctorId);

      // Estatísticas básicas do médico
      const totalAppointments = doctorAppointments.length;
      const confirmedAppointments = doctorAppointments.filter(a => a.status === 'confirmed').length;
      const pendingAppointments = doctorAppointments.filter(a => a.status === 'pending').length;
      const cancelledAppointments = doctorAppointments.filter(a => a.status === 'cancelled').length;

      // Contagem de pacientes únicos atendidos pelo médico
      const uniquePatients = new Set(doctorAppointments.map(a => a.patientId));
      const totalPatients = uniquePatients.size;

      // Percentuais de cada status
      const statusPercentages = {
        confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
        pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
        cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
      };

      // Retorna objeto parcial de estatísticas do médico
      return {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalPatients,
        statusPercentages,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas do médico:', error);
      throw error;
    }
  },

  // Estatísticas específicas de um paciente
  async getPatientStatistics(patientId: string): Promise<Partial<Statistics>> {
    try {
      // Busca todas as consultas do armazenamento
      const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
      const allAppointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
      
      // Filtra apenas consultas do paciente informado
      const patientAppointments = allAppointments.filter(a => a.patientId === patientId);

      // Estatísticas básicas do paciente
      const totalAppointments = patientAppointments.length;
      const confirmedAppointments = patientAppointments.filter(a => a.status === 'confirmed').length;
      const pendingAppointments = patientAppointments.filter(a => a.status === 'pending').length;
      const cancelledAppointments = patientAppointments.filter(a => a.status === 'cancelled').length;

      // Contagem de consultas por especialidade
      const specialties: { [key: string]: number } = {};
      patientAppointments.forEach(appointment => {
        if (specialties[appointment.specialty]) {
          specialties[appointment.specialty]++;
        } else {
          specialties[appointment.specialty] = 1;
        }
      });

      // Contagem de médicos únicos que atenderam o paciente
      const uniqueDoctors = new Set(patientAppointments.map(a => a.doctorId));
      const totalDoctors = uniqueDoctors.size;

      // Percentuais de cada status
      const statusPercentages = {
        confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
        pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
        cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
      };

      // Retorna objeto parcial de estatísticas do paciente
      return {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalDoctors,
        specialties,
        statusPercentages,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas do paciente:', error);
      throw error;
    }
  },
};
