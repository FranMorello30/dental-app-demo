import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { MedicalHistory } from '@shared/models/appointement.model';
import { Paciente, PacientesResponse } from '@shared/models/pacientes.model';
import {
    CreateTreatmentPlanPayload,
    TreatmentPlan,
} from '@shared/models/treatment-plan.model';
import { map, type Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PacienteService {
    private readonly _http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

    getPatients(): Observable<Paciente[]> {
        return this._http
            .get<PacientesResponse>(`${this.baseUrl}/patients`)
            .pipe(map((response) => response.patients));
    }

    getPatientById(id: string): Observable<Paciente> {
        return this._http.get<Paciente>(`${this.baseUrl}/patients/${id}`);
    }

    getTreatmentPlans(): Observable<TreatmentPlan[]> {
        return this._http.get<TreatmentPlan[]>(
            `${this.baseUrl}/treatment-plans`
        );
    }

    getMedicalHistories(): Observable<MedicalHistory[]> {
        return this._http.get<MedicalHistory[]>(
            `${this.baseUrl}/medical-histories`
        );
    }

    createTreatmentPlan(
        payload: CreateTreatmentPlanPayload
    ): Observable<TreatmentPlan> {
        return this._http.post<TreatmentPlan>(
            `${this.baseUrl}/treatment-plans`,
            payload
        );
    }

    createPatient(patient: Partial<Paciente>): Observable<Paciente> {
        return this._http.post<Paciente>(`${this.baseUrl}/patients`, patient);
    }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this._http.post(`${this.baseUrl}/uploads`, formData);
    }
}
