import { Paciente } from './pacientes.model';

export interface TreatmentProcedure {
    id: string;
    name: string;
    description: string;
    cost: number;
    scheduled_date: string;
    completed_date: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreateTreatmentProcedurePayload {
    name: string;
    description: string;
    cost: number;
    scheduled_date: string;
}

export interface CreateTreatmentPlanPayload {
    name: string;
    description: string;
    start_date: string;
    progress?: number;
    total_cost: number;
    paid_amount: number;
    estimated_end_date?: string;
    status?: string;
    patientId: string;
    procedures: CreateTreatmentProcedurePayload[];
}

export interface TreatmentPlan {
    id: string;
    name: string;
    description: string;
    start_date: string;
    progress: number;
    total_cost: number;
    paid_amount: number;
    estimated_end_date: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    patient: Paciente;
    procedures: TreatmentProcedure[];
}
