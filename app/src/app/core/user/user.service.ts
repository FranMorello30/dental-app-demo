import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Usuario } from '@shared/models/usuario.model';
import { map, Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<Usuario> = new ReplaySubject<Usuario>(1);
    private readonly _baseUrl = environment.baseUrl;

    set user(value: Usuario) {
        this._user.next(value);
    }

    get user$(): Observable<Usuario> {
        return this._user.asObservable();
    }

    get(): Observable<Usuario> {
        return this.user$;
    }

    update(estado: string): Observable<any> {
        return this._httpClient
            .patch<Usuario>(`${this._baseUrl}/auth/estado`, { estado })
            .pipe(
                map((response) => {
                    this._user.next(response);
                })
            );
    }
}
