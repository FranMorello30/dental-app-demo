import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
    Schedules,
    SchedulesResponse,
    UnavailabilitiesResponse,
    Unavailability,
} from '@shared/models/dentist.model';
import { map, type Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OdontologoService {
    private readonly _http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

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
