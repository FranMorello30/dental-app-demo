import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormTratamientoComponent } from './form-tratamiento/form-tratamiento.component';

@Component({
    selector: 'plan-tratamiento',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        FormTratamientoComponent,
    ],
    templateUrl: './plan-tratamiento.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanTratamientoComponent {
    private readonly _matDialog = inject(MatDialog);

    registerEvent = false;
    treatmentPlansData = [
        {
            id: 1,
            name: 'Plan Ortodoncia 2025',
            description:
                'Tratamiento completo de ortodoncia con brackets metálicos',
            startDate: '2025-01-20',
            estimatedEndDate: '2026-01-20',
            status: 'En progreso',
            progress: 25,
            totalCost: 3000,
            paidAmount: 1000.0,
            treatments: [
                {
                    id: 1,
                    name: 'Colocación de brackets',
                    status: 'Completado',
                    date: '2025-01-20',
                },
                {
                    id: 2,
                    name: 'Primera revisión',
                    status: 'Completado',
                    date: '2025-02-20',
                },
                {
                    id: 3,
                    name: 'Segunda revisión',
                    status: 'Programado',
                    date: '2025-04-20',
                },
                {
                    id: 4,
                    name: 'Tercera revisión',
                    status: 'Pendiente',
                    date: '2025-06-20',
                },
                {
                    id: 5,
                    name: 'Retirada de brackets',
                    status: 'Pendiente',
                    date: '2026-01-20',
                },
            ],
        },
        {
            id: 2,
            name: 'Tratamiento de caries',
            description: 'Tratamiento de caries en molares superiores',
            startDate: '2024-11-15',
            estimatedEndDate: '2024-12-15',
            status: 'Completado',
            progress: 100,
            totalCost: 250.0,
            paidAmount: 250.0,
            treatments: [
                {
                    id: 1,
                    name: 'Diagnóstico y radiografías',
                    status: 'Completado',
                    date: '2024-11-15',
                },
                {
                    id: 2,
                    name: 'Empaste en molar superior izquierdo',
                    status: 'Completado',
                    date: '2024-11-25',
                },
                {
                    id: 3,
                    name: 'Revisión final',
                    status: 'Completado',
                    date: '2024-12-10',
                },
            ],
        },
    ];

    public openForm(): void {
        // this.registerEvent = true;
        // Uncomment the following lines if you want to open the form in a dialog
        this._matDialog.open(FormTratamientoComponent, {
            disableClose: true,
            backdropClass: 'bg-transparent',
        });
    }

    formatDate(dateString: string | null | undefined) {
        if (!dateString) return 'No registrada';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}
