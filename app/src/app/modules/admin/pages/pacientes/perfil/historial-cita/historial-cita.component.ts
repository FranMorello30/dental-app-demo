import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'historial-cita',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './historial-cita.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialCitaComponent {
    public appointmentHistoryData = [
        {
            id: 1,
            date: '2025-03-15',
            treatment: 'Limpieza Dental',
            dentist: 'Dr. María García',
            status: 'Completada',
            notes: 'Paciente sin problemas, próxima revisión en 6 meses',
            cost: 80.0,
            paid: true,
        },
        {
            id: 2,
            date: '2025-01-20',
            treatment: 'Extracción',
            dentist: 'Dr. Carlos Ruiz',
            status: 'Completada',
            notes: 'Extracción de muela del juicio, seguimiento en 2 semanas',
            cost: 150.0,
            paid: true,
        },
        {
            id: 3,
            date: '2024-11-05',
            treatment: 'Revisión',
            dentist: 'Dr. María García',
            status: 'Cancelada',
            notes: 'Radiografías realizadas, se detecta caries incipiente en molar inferior derecho',
            cost: 50.0,
            paid: true,
        },
        {
            id: 4,
            date: '2024-08-12',
            treatment: 'Empaste',
            dentist: 'Dr. Carlos Ruiz',
            status: 'Completada',
            notes: 'Empaste en molar inferior derecho, seguimiento satisfactorio',
            cost: 95.0,
            paid: true,
        },
    ];

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
