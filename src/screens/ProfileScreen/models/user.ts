export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  specialty?: string;
}

export const getRoleText = (role: string): string => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "doctor":
      return "Médico";
    case "patient":
      return "Paciente";
    default:
      return role;
  }
};