import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpHeaders,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

import { Observable, catchError, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (
        authService.accessToken === undefined ||
        authService.accessToken === 'undefined'
    ) {
        router.navigate(['/sign-in']);
    }

    // Clone the request object
    let newReq = req.clone();

    const headers = new HttpHeaders({
        Authorization: `Bearer ${authService.accessToken}`,
    });

    if (authService.accessToken) {
        newReq = req.clone({
            headers: headers,
        });
    }
    // req.headers.set(
    //     'Authorization','Bearer ' + authService.accessToken,
    //     'Base', 'ffff',
    // ),
    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" responses
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // Sign out
                authService.signOut();

                // Reload the app
                location.reload();
            }

            return throwError(error);
        })
    );
};
