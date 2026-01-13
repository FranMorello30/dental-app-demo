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
                id: 'Calendario',
                title: 'Calendario',

                type: 'basic',
                icon: 'feather:calendar',
                link: '/admin/calendario',
                disabled: false,
            },
            {
                id: 'pacientes',
                title: 'Pacientes',

                type: 'basic',
                icon: 'feather:users',
                link: '/admin/pacientes',
                disabled: false,
            },

            {
                id: 'odontologos',
                title: 'Odontólogos',

                type: 'basic',
                icon: 'custom_outline:stethoscope',
                link: '/admin/odontologos',
                disabled: false,
            },

            {
                id: 'configuraciones',
                title: 'Configuraciones',

                type: 'basic',
                icon: 'feather:settings',
                link: '/admin/configuraciones',
                disabled: false,
            },
            {
                id: 'inventario',
                title: 'Inventario',

                type: 'basic',
                icon: 'feather:box',
                link: '/admin/inventario',
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
