export interface TreatmentResponse {
    treatments: Treatment[];
}

export interface Treatment {
    id: string;
    name: string;
    price: string;
    duration: number;
    description: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}
