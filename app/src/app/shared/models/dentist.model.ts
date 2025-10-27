export interface DentistResponse {
    dentists: Dentist[];
}

export interface SchedulesResponse {
    schedules: Schedules[];
}

export interface UnavailabilitiesResponse {
    unavailabilities: Unavailability[];
}

export interface Dentist {
    id: string;
    name: string;
    apellido: string;
    phone: string;
    email: string;
    avatar: string;
    specialty: string;
    nro_Id: string;
    license_number: string;
    notes: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    schedules: Schedules[];
    unavailabilities: Unavailability[];
}

export interface Schedules {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_working_day: boolean;
    created_at: string;
    updated_at: string;
    breaks: Break[];
}

export interface Break {
    id: string;
    start_time: string;
    end_time: string;
    created_at: string;
    updated_at: string;
}

export interface Unavailability {
    id: string;
    unavailable_date: Date;
    reason: string;
    created_at: string;
    updated_at: string;
}
