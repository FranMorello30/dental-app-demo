import { ApplicationRef, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService extends Socket {
    // private BehaviorSubject que mantiene el estado
    private _socketStatus$ = new BehaviorSubject<boolean>(false);
    // Observable público
    public socketStatus$ = this._socketStatus$.asObservable();

    constructor(appRef: ApplicationRef) {
        super(
            {
                url: environment.wsUrl,
                options: {
                    extraHeaders: {
                        auth: sessionStorage.getItem('accessToken'),
                    },
                },
            },
            appRef
        );
        this.checkStatus();
    }

    checkStatus(): void {
        this.ioSocket.on('connect', () => {
            this._socketStatus$.next(true);
        });

        this.ioSocket.on('disconnect', () => {
            this._socketStatus$.next(false);
        });
    }

    conectarSocket(): void {
        this.ioSocket.io.opts.extraHeaders = {
            auth: sessionStorage.getItem('accessToken'),
        };
        this.ioSocket.connect();
    }

    desconectarSocket(): void {
        this.ioSocket.disconnect();
    }

    emit<Ep extends any[], Ev extends string = string>(
        evento: Ev,
        ...args: Ep
    ): this {
        this.ioSocket.emit(evento, ...args);
        return this;
    }

    listen(evento: string) {
        return this.fromEvent(evento);
    }
}
