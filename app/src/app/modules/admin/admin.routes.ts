import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export default [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'calendario',
                loadChildren: () =>
                    import('@modules/admin/pages/calendario/calendario.routes'),
            },
            {
                path: 'pacientes',
                loadChildren: () =>
                    import('@modules/admin/pages/pacientes/pacientes.routes'),
            },
            {
                path: 'odontologos',
                loadChildren: () =>
                    import(
                        '@modules/admin/pages/odontologos/odontologos.routes'
                    ),
            },
            {
                path: 'configuraciones',
                loadChildren: () =>
                    import(
                        '@modules/admin/pages/configuraciones/configuraciones.routes'
                    ),
            },
        ],
    },
] as Routes;
