import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Mensaje } from '@shared/interfaces/mensaje';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private readonly baseUrl = environment.baseUrl;
    constructor(private http: HttpClient) {}

    uploadArchivo(archivo: FormData): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/uploads`, archivo);
    }
    borrarArchivo(archivo: string, carpeta: string): Observable<string> {
        return this.http
            .delete<Mensaje>(`${this.baseUrl}/uploads/${carpeta}/${archivo}`)
            .pipe(map((respuesta) => respuesta.message));
    }
}
