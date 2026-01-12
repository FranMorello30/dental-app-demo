import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Paciente, PacientesResponse } from '@shared/models/pacientes.model';
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

    createPatient(patient: Partial<Paciente>): Observable<Paciente> {
        return this._http.post<Paciente>(`${this.baseUrl}/patients`, patient);
    }
}
