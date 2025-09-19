import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";
import { notificationService } from "../../../services/notifications";
import { appointmentService } from "../services/appointmentService";
import { Appointment } from "../models/appointment";
import { Doctor } from "../models/doctor";

export const useCreateAppointment = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!date || !selectedTime || !selectedDoctor) {
        setError("Por favor, preencha a data e selecione um médico e horário");
        return;
      }

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: user?.id || "",
        patientName: user?.name || "",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        time: selectedTime,
        specialty: selectedDoctor.specialty,
        status: "pending",
      };

      await appointmentService.saveAppointment(newAppointment);

      await notificationService.notifyNewAppointment(
        selectedDoctor.id,
        newAppointment
      );

      alert("Consulta agendada com sucesso!");
      navigation.goBack();
    } catch (err) {
      setError("Erro ao agendar consulta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    date,
    setDate,
    selectedTime,
    selectedDoctor,
    loading,
    error,
    handleCreateAppointment,
    setSelectedTime,
    setSelectedDoctor,
  };
};