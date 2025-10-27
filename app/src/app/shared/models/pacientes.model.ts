export interface PacientesResponse {
    paciente: Paciente;
    patients: Paciente[];
}

export interface Paciente {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    last_appointment: string | null;
    next_appointment: string | null;
    insurance: string;
    balance: string;
    notes: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    dni: string;
}
