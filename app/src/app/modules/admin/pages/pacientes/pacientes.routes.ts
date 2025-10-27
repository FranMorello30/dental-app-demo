import { Routes } from '@angular/router';
import { PacientesComponent } from './pacientes.component';

export default [
    {
        path: '',
        component: PacientesComponent,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('@modules/admin/pages/pacientes/tabla/tabla.routes'),
            },
            {
                path: 'perfil/:id',
                loadChildren: () =>
                    import(
                        '@modules/admin/pages/pacientes/perfil/perfil.routes'
                    ),
            },
        ],
    },
] as Routes;
