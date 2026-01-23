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

    getDentist(id: string): Observable<Dentist> {
        return this._http
            .get<{ dentist: Dentist }>(`${this.baseUrl}/odontologos/${id}`)
            .pipe(map((response) => response.dentist));
    }

    createDentist(payload: CreateDentistPayload): Observable<Dentist> {
        return this._http.post<Dentist>(`${this.baseUrl}/odontologos`, payload);
    }

    updateDentist(
        dentistId: string,
        payload: CreateDentistPayload
    ): Observable<Dentist> {
        return this._http.patch<Dentist>(
            `${this.baseUrl}/odontologos/${dentistId}`,
            payload
        );
    }

    createSchedules(payload: CreateSchedulePayload[]): Observable<Schedules[]> {
        return this._http.post<Schedules[]>(
            `${this.baseUrl}/odontologos/schedule`,
            payload
        );
    }

    replaceSchedules(
        dentistId: string,
        payload: CreateSchedulePayload[]
    ): Observable<Schedules[]> {
        return this._http.put<Schedules[]>(
            `${this.baseUrl}/odontologos/schedule/${dentistId}`,
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

    replaceUnavailability(
        dentistId: string,
        payload: CreateUnavailabilityPayload[]
    ): Observable<void> {
        return this._http.put<void>(
            `${this.baseUrl}/odontologos/unavailability/${dentistId}`,
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

    createSpecialty(payload: {
        name: string;
        description?: string;
    }): Observable<Specialty> {
        return this._http.post<Specialty>(
            `${this.baseUrl}/specialties`,
            payload
        );
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
