import { Routes } from '@angular/router';
import { ConfiguracionesComponent } from './configuraciones.component';

export default [
    {
        path: '',
        component: ConfiguracionesComponent,
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
