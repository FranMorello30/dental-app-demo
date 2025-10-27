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
import { ModalRegistroPatientComponent } from './modal-registro/modal-registro.component';

@Component({
    selector: 'app-tabla',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        ModalRegistroPatientComponent,
    ],
    templateUrl: './tabla.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComponent implements OnInit {
    private readonly _router = inject(Router);
    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _patientService = inject(PacienteService);

    public initialPatients: Paciente[] = [];
    isOpenModalRegistro = false;
    ngOnInit(): void {
        this._getPatients();
    }

    public abrirModalRegistro(): void {
        this.isOpenModalRegistro = true;
    }
    public irPerfil(id: number): void {
        this._router.navigate([`admin/pacientes/perfil/${id}`]);
    }
    private _getPatients(): void {
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
