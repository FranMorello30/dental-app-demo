import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, of, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    private menu = {
        menu: [
            {
                id: 'odontologos',
                title: 'odontologos',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/odontologos',
                disabled: false,
            },
            {
                id: 'pacientes',
                title: 'Pacientes',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/pacientes',
                disabled: false,
            },

            {
                id: 'reservaciones',
                title: 'Reservaciones',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/reservaciones',
                disabled: false,
            },

            {
                id: 'citas',
                title: 'Gestión',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/citas',
                disabled: false,
            },
            {
                id: 'inventario',
                title: 'inventario',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/inventario',
                disabled: false,
            },

            {
                id: 'facturas',
                title: 'facturas',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/facturas',
                disabled: false,
            },
            {
                id: 'odontograma',
                title: 'odontograma',

                type: 'basic',
                icon: 'mat_outline:add_task',
                link: '/odontograma',
                disabled: false,
            },
        ],
    };

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        const menu = this.menu;
        const menuApp = this.moldearMenu(menu.menu);
        this._navigation.next(menuApp);
        return of(menuApp);
    }

    moldearMenu(menu: any[]): Navigation {
        return {
            compact: menu,
            default: menu,
            futuristic: menu,
            horizontal: menu,
        };
    }
}
