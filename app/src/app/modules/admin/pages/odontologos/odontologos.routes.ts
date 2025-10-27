import { Routes } from '@angular/router';
import { OdontologosComponent } from './odontologos.component';

export default [
    {
        path: '',
        component: OdontologosComponent,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import(
                        '@modules/admin/pages/odontologos/tabla/tabla.routes'
                    ),
            },
            {
                path: 'perfil/:id',
                loadChildren: () =>
                    import(
                        '@modules/admin/pages/odontologos/perfil/perfil.routes'
                    ),
            },
        ],
    },
] as Routes;
