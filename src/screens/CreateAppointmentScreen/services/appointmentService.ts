import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment } from "../models/appointment";

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const storedAppointments = await AsyncStorage.getItem("@MedicalApp:appointments");
    return storedAppointments ? JSON.parse(storedAppointments) : [];
  },

  async saveAppointment(appointment: Appointment): Promise<void> {
    const appointments = await this.getAppointments();
    appointments.push(appointment);
    await AsyncStorage.setItem("@MedicalApp:appointments", JSON.stringify(appointments));
  },
};