import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Usuario } from '@shared/models/usuario.model';

import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _baseUrl = environment.baseUrl;
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        const token = sessionStorage.getItem('accessToken') ?? '';

        if (token.trim().length === 0) {
            this._authenticated = false;
            this.signOut();
            return;
        }

        if (token == 'undefined') {
            this._authenticated = false;
            this.signOut();
            return;
        }

        if (token == undefined) {
            this._authenticated = false;
            this.signOut();
            return;
        }

        return token;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    signIn(credentials: {
        username: string;
        password: string;
    }): Observable<Usuario> {
        return this._httpClient
            .post<Usuario>(`${this._baseUrl}/auth/login`, {
                username: credentials.username,
                password: credentials.password,
            })
            .pipe(
                switchMap((usuario: Usuario) => {
                    this.accessToken = usuario.token;
                    this._authenticated = true;
                    this._userService.user = usuario;
                    return of(usuario);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient.get(`${this._baseUrl}/auth/check-status`).pipe(
            catchError((err) => {
                console.warn(err);
                // Return false
                return of(false);
            }),
            switchMap((usuario: Usuario) => {
                this.accessToken = usuario.token;
                this._authenticated = true;
                this._userService.user = usuario;
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        sessionStorage.removeItem('accessToken');
        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        // if (AuthUtils.isTokenExpired(this.accessToken)) {
        //     return of(false);
        // }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
