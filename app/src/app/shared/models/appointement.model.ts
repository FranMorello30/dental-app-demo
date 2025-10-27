import { Dentist } from './dentist.model';
import { Paciente } from './pacientes.model';

export interface AppointmentResponse {
    appointments: Appointment[];
}

export interface Appointment {
    id: string;
    title: string;
    description: string;
    start_time: Date; // ISO date string
    end_time: Date; // ISO date string
    status: string;
    treatment: string;
    notes: string | null;
    cancellation_reason: string | null;
    created_at: Date; // ISO date string
    updated_at: Date; // ISO date string
    is_deleted: boolean;
    dentist: Dentist;
    patient: Paciente;
}
