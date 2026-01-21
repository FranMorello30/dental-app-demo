import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
    Dentist,
    DentistResponse,
    Schedules,
    SchedulesResponse,
    UnavailabilitiesResponse,
    Unavailability,
} from '@shared/models/dentist.model';
import { map, type Observable } from 'rxjs';

export interface Specialty {
    id: string;
    name: string;
    description?: string;
}

export interface CreateDentistPayload {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    specialty: string;
    nro_Id: number;
    license_number: string;
    notes?: string;
    isActive?: boolean;
}

export interface CreateSchedulePayload {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_working_day: boolean;
    dentistId: string;
}

export interface CreateUnavailabilityPayload {
    dentistId: string;
    unavailable_date: Date;
    reason?: string;
}

export interface CreateBreakPayload {
    scheduleId: string;
    start_time: string;
    end_time: string;
}

@Injectable({
    providedIn: 'root',
})
export class OdontologoService {
    private readonly _http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

    getDentists(): Observable<Dentist[]> {
        return this._http
            .get<DentistResponse>(`${this.baseUrl}/odontologos`)
            .pipe(map((response) => response.dentists));
    }

    createDentist(payload: CreateDentistPayload): Observable<Dentist> {
        return this._http.post<Dentist>(`${this.baseUrl}/odontologos`, payload);
    }

    createSchedules(payload: CreateSchedulePayload[]): Observable<void> {
        return this._http.post<void>(
            `${this.baseUrl}/odontologos/schedule`,
            payload
        );
    }

    createUnavailability(
        payload: CreateUnavailabilityPayload
    ): Observable<void> {
        return this._http.post<void>(
            `${this.baseUrl}/odontologos/unavailability`,
            payload
        );
    }

    createBreak(payload: CreateBreakPayload): Observable<void> {
        return this._http.post<void>(
            `${this.baseUrl}/odontologos/schedule-break`,
            payload
        );
    }

    getSpecialties(): Observable<Specialty[]> {
        return this._http.get<Specialty[]>(`${this.baseUrl}/specialties`);
    }

    getSchedule(dentistId: string): Observable<Schedules[]> {
        return this._http
            .get<SchedulesResponse>(
                `${this.baseUrl}/odontologos/schedule/${dentistId}`
            )
            .pipe(map((response) => response.schedules));
    }

    getUnavailability(dentistId: string): Observable<Unavailability[]> {
        return this._http
            .get<UnavailabilitiesResponse>(
                `${this.baseUrl}/odontologos/unavailability/${dentistId}`
            )
            .pipe(map((response) => response.unavailabilities));
    }
}
