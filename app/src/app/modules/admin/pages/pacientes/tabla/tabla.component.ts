import {
    animate,
    group,
    query,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Paciente } from '@shared/models/pacientes.model';
import { PacienteService } from '../pacientes.service';
import { SidebarRegistroPatientComponent } from './sidebar-registro/sidebar-registro.component';

@Component({
    selector: 'app-tabla',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        SidebarRegistroPatientComponent,
    ],
    templateUrl: './tabla.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                group([
                    animate('250ms ease-out', style({ opacity: 1 })),
                    query('.sidebar-panel', [
                        style({ transform: 'translateX(100%)' }),
                        animate(
                            '250ms ease-out',
                            style({ transform: 'translateX(0)' })
                        ),
                    ]),
                ]),
            ]),
            transition(':leave', [
                group([
                    animate('200ms ease-in', style({ opacity: 0 })),
                    query('.sidebar-panel', [
                        animate(
                            '200ms ease-in',
                            style({ transform: 'translateX(100%)' })
                        ),
                    ]),
                ]),
            ]),
        ]),
    ],
})
export class TablaComponent implements OnInit {
    private readonly _router = inject(Router);
    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _patientService = inject(PacienteService);

    public initialPatients: Paciente[] = [];
    isOpenSidebarRegistro = false;
    ngOnInit(): void {
        this.getPatients();
    }

    public abrirModalRegistro(): void {
        this.isOpenSidebarRegistro = true;
    }
    public irPerfil(id: number): void {
        this._router.navigate([`admin/pacientes/perfil/${id}`]);
    }
    public getPatients(): void {
        this._patientService.getPatients().subscribe({
            next: (patients) => {
                this.initialPatients = patients;
                this._detectChange.markForCheck();
            },
            error: (error) => {
                console.error('Error fetching patients:', error);
            },
        });
    }
}
