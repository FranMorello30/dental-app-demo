import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    OnInit,
    output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '@shared/models/appointement.model';
import { AppointmentStatus } from '../../calendario.model';
import { CalendarioService } from '../../calendario.service';

@Component({
    selector: 'modal-evento',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './modal-evento.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalEventoComponent implements OnInit {
    private readonly _calendarioService = inject(CalendarioService);

    public selectedEvent = input.required<Appointment>();
    public isClosed = output<boolean>();
    public changedEvent = output<boolean>();
    public edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];

    editingStatus = false;

    inputEstado = new FormControl('');

    ngOnInit(): void {
        this.inputEstado.setValue(this.selectedEvent().status);

        // this.inputEstado.valueChanges.subscribe((value) => {
        //     if (value) {
        //         this.selectedEvent().status = value;
        //         this._calendarioService.updateAppointmentStatus(
        //             this.selectedEvent().id,
        //             value
        //         );
        //         this.changedEvent.emit(true);
        //         this.editingStatus = false;
        //     }
        // });
    }

    formatWeekDay(date: Date) {
        const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        return days[date.getDay()];
    }
    formatMonth(date: Date) {
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            year: 'numeric',
        };
        return date.toLocaleDateString('es-ES', options);
    }
    getStatusColor(status: string): string {
        switch (status) {
            case 'Sin confirmar':
                return 'bg-yellow-400';
            case 'Confirmada':
                return 'bg-green-500';
            case 'En consulta':
                return 'bg-purple-500';
            case 'Cancelada':
                return 'bg-red-500';
            case 'Finalizada':
                return 'bg-gray-500';
            case 'Finalizada (Pendiente)':
                return 'bg-orange-500'; // Color distintivo para citas finalizadas pendientes de documentación
            default:
                return 'bg-blue-500';
        }
    }
    closedEvent() {
        this.isClosed.emit(true);
    }
    changeStatus() {
        this.editingStatus = !this.editingStatus;
        if (!this.editingStatus) {
            this.selectedEvent().status = this.inputEstado
                .value as AppointmentStatus;
            this._calendarioService
                .updateAppointmentStatus(
                    this.selectedEvent().id,
                    this.selectedEvent().status
                )
                .subscribe({
                    next: () => {
                        this.changedEvent.emit(true);
                    },
                    error: (err) => {
                        console.error(
                            'Error updating appointment status:',
                            err
                        );
                    },
                });
        }
    }
}
