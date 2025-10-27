import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '@core/user/user.service';
import { Usuario } from '@shared/models/usuario.model';

@Component({
    selector: 'header-panel',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
    templateUrl: './header-panel.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPanelComponent implements OnInit, OnDestroy {
    private readonly _userService = inject(UserService);
    currentTime: string;
    ampm: string;
    public user: Usuario;
    private timerId: any;
    isOpen = false;
    public menuItems = [
        { icon: 'feather:calendar', name: 'Calendario', path: '/' },
        { icon: 'feather:bar-chart-2', name: 'Dashboard', path: '/dashboard' },
        { icon: 'feather:users', name: 'Pacientes', path: '/patients' },
        { icon: 'feather:box', name: 'Inventario', path: '/inventory' },
        { icon: 'feather:file-text', name: 'Facturación', path: '/billing' },
        {
            icon: 'feather:bell',
            name: 'Notificaciones',

            path: '/notifications',
        },
        { icon: 'feather:user', name: 'Perfil', path: '/profile' },
        { icon: 'feather:settings', name: 'Configuración', path: '/settings' },
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private _router: Router
    ) {}

    ngOnInit() {
        this._userService.user$.subscribe((user: Usuario) => {
            this.user = user;
            //console.log(this.user);
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy() {}

    signOut(): void {
        this._router.navigate(['/sign-out']);
    }
}
