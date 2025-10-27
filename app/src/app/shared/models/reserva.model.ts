import { Agenda } from './odontologo.model';
import { Paciente } from './pacientes.model';

export interface ReservaResponse {
    reservaciones: Reserva[];
}
export interface Reserva {
    id: string;
    fecha: Date;
    hora: string;
    hora_fin: string;
    duracion: number;
    estado: string;
    convertidaACita: boolean;
    fecha_creacion: Date;
    paciente: Paciente;
    agenda: Agenda;
}
