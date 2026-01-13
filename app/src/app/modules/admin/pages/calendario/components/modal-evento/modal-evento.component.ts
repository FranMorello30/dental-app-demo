import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    OnInit,
    output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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

    reprogramming = false;
    newDateControl = new FormControl('');
    newTimeControl = new FormControl('');
    newEndTimeControl = new FormControl('');
    treatmentControl = new FormControl('', {
        nonNullable: false,
        validators: [Validators.required],
    });
    minDate: string;

    ngOnInit(): void {
        this.inputEstado.setValue(this.selectedEvent().status);
        const today = new Date();
        this.minDate = today.toISOString().split('T')[0];

        const start = new Date(this.selectedEvent().start_time);
        const end = new Date(this.selectedEvent().end_time);
        this.newDateControl.setValue(start.toISOString().split('T')[0]);
        this.newTimeControl.setValue(this.formatTime(start));
        this.newEndTimeControl.setValue(this.formatTime(end));
        this.treatmentControl.setValue(this.selectedEvent().treatment || '');

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

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
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

    toggleReprogramming() {
        this.reprogramming = !this.reprogramming;
        if (this.reprogramming) {
            // Initialize with current values
            const start = new Date(this.selectedEvent().start_time);
            this.newDateControl.setValue(start.toISOString().split('T')[0]);
            this.newTimeControl.setValue(this.formatTime(start));

            const end = new Date(this.selectedEvent().end_time);
            this.newEndTimeControl.setValue(this.formatTime(end));
            this.treatmentControl.setValue(
                this.selectedEvent().treatment || ''
            );
        }
    }

    saveReschedule() {
        if (
            this.newDateControl.invalid ||
            this.newTimeControl.invalid ||
            this.treatmentControl.invalid
        ) {
            return;
        }

        const dateStr = this.newDateControl.value;
        const timeStr = this.newTimeControl.value;
        const endTimeStr = this.newEndTimeControl.value;
        const treatment = this.treatmentControl.value?.trim();

        // Validation: Past date check
        const selectedDate = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('No puedes reprogramar a una fecha pasada.');
            return;
        }

        // Combine date and time
        const startDateTime = new Date(`${dateStr}T${timeStr}:00`);
        let endDateTime: Date;

        if (endTimeStr) {
            endDateTime = new Date(`${dateStr}T${endTimeStr}:00`);
        } else {
            // Preserve duration if no end time provided
            const originalStart = new Date(this.selectedEvent().start_time);
            const originalEnd = new Date(this.selectedEvent().end_time);
            const durationMs = originalEnd.getTime() - originalStart.getTime();
            endDateTime = new Date(startDateTime.getTime() + durationMs);
        }

        if (endDateTime <= startDateTime) {
            alert('La hora fin debe ser mayor a la hora de inicio.');
            return;
        }

        // Format for backend (YYYY-MM-DD HH:mm:ss)
        const formatDateTime = (date: Date) => {
            const yyyy = date.getFullYear();
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            const hh = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            const ss = date.getSeconds().toString().padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };

        const payload = {
            start_time: formatDateTime(startDateTime),
            end_time: formatDateTime(endDateTime),
            treatment: treatment,
            description: this.selectedEvent().description,
            dentistId: this.selectedEvent().dentist.id, // Ensure dentist is preserved
            patientId: this.selectedEvent().patient.id,
        };

        this._calendarioService
            .updateAppointment(this.selectedEvent().id, payload)
            .subscribe({
                next: () => {
                    this.changedEvent.emit(true);
                    this.closedEvent();
                },
                error: (err) => {
                    console.error('Error rescheduling appointment:', err);
                    alert('Error al reprogramar la cita.');
                },
            });
    }
}
