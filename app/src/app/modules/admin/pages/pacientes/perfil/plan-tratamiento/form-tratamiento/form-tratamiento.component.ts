import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    output,
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'form-tratamiento',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    templateUrl: './form-tratamiento.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTratamientoComponent {
    public readonly matDialogRef = inject(
        MatDialogRef<FormTratamientoComponent>
    );

    public newTreatmentForm = false;

    public treatments = [
        // {
        //     id: '1',
        //     name: 'Limpieza Dental',
        //     description: 'Limpieza profunda de dientes y encías.',
        //     priority: 'medium',
        //     estimatedDuration: '30 minutos',
        //     estimatedCost: 50,
        // },
        // {
        //     id: '2',
        //     name: 'Ortodoncia',
        //     description: 'Tratamiento de alineación dental.',
        //     priority: 'high',
        //     estimatedDuration: '6 meses',
        //     estimatedCost: 1500,
        // },
    ];

    public isClosed = output<boolean>();

    cerrarForm() {
        //this.isClosed.emit(true);
        this.matDialogRef.close();
    }
    getPriorityColor(priority: string) {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-500/20 border-red-400/30';
            case 'medium':
                return 'text-amber-400 bg-amber-500/20 border-amber-400/30';
            case 'low':
                return 'text-green-400 bg-green-500/20 border-green-400/30';
            default:
                return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
        }
    }
    getPriorityLabel(priority: string) {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Media';
            case 'low':
                return 'Baja';
            default:
                return 'Media';
        }
    }
    crearTreatment() {
        // Aquí puedes implementar la lógica para crear un nuevo tratamiento
        // Por ejemplo, enviar los datos a un servicio o API
        console.log('Nuevo tratamiento creado');
        this.newTreatmentForm = false;
        this.treatments.push({
            id: '1',
            name: 'Limpieza Dental',
            description: 'Limpieza profunda de dientes y encías.',
            priority: 'medium',
            estimatedDuration: '30 minutos',
            estimatedCost: 50,
        });
    }
}
