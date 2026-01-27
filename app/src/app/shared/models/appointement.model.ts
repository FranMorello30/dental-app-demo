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
    medical_histories?: MedicalHistory[];
}

export interface MedicalHistory {
    id: string;
    date: Date;
    diagnosis: string;
    treatment: string;
    medications: string;
    notes: string;
    treated_teeth?: TreatedTooth[];
    attachments?: MedicalAttachment[];
}

export interface TreatedTooth {
    id: string;
    tooth_number: number;
    treatment: string;
}

export interface MedicalAttachment {
    id: string;
    name: string;
    file_type: string;
    file_path: string;
    file_size: number;
}
