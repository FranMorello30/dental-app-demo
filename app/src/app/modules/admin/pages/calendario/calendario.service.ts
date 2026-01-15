import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Mensaje } from '@shared/interfaces/mensaje';
import {
    Appointment,
    AppointmentResponse,
} from '@shared/models/appointement.model';
import { Dentist, DentistResponse } from '@shared/models/dentist.model';
import { Paciente, PacientesResponse } from '@shared/models/pacientes.model';
import { Treatment, TreatmentResponse } from '@shared/models/treatment.model';
import { map, type Observable } from 'rxjs';

// import {
//     Appointment,
//     AppointmentStatus,
//     Doctor,
//     Patient,
// } from './calendario.model';

@Injectable({
    providedIn: 'root',
})
export class CalendarioService {
    private readonly _http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

    getAllDentists(): Observable<Dentist[]> {
        return this._http
            .get<DentistResponse>(`${this.baseUrl}/odontologos`)
            .pipe(map((response) => response.dentists));
    }

    getAllTreatments(): Observable<Treatment[]> {
        return this._http
            .get<TreatmentResponse>(`${this.baseUrl}/treatments`)
            .pipe(map((response) => response.treatments));
    }
    getAllPatients(): Observable<Paciente[]> {
        return this._http
            .get<PacientesResponse>(`${this.baseUrl}/patients`)
            .pipe(map((response) => response.patients));
    }
    createAppointment(cita: any): Observable<string> {
        return this._http
            .post<Mensaje>(`${this.baseUrl}/appointments`, { ...cita })
            .pipe(map((response) => response.message));
    }
    getAppointments(): Observable<Appointment[]> {
        return this._http
            .get<AppointmentResponse>(`${this.baseUrl}/appointments`)
            .pipe(map((response) => response.appointments));
    }
    updateAppointmentStatus(id: string, status: string): Observable<string> {
        return this._http
            .patch<Mensaje>(`${this.baseUrl}/appointments/status/${id}`, {
                status,
            })
            .pipe(map((response) => response.message));
    }

    updateAppointment(id: string, appointment: any): Observable<string> {
        return this._http
            .put<Mensaje>(`${this.baseUrl}/appointments/${id}`, appointment)
            .pipe(map((response) => response.message));
    }

    rescheduleAppointment(
        id: string,
        payload: { start_time: string; end_time: string }
    ): Observable<string> {
        return this._http
            .patch<Mensaje>(
                `${this.baseUrl}/appointments/reschedule/${id}`,
                payload
            )
            .pipe(map((response) => response.message));
    }

    createMedicalHistory(payload: any): Observable<any> {
        return this._http.post(`${this.baseUrl}/medical-histories`, payload);
    }
}
