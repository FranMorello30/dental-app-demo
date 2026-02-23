import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnInit,
    SimpleChanges,
    inject,
    input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '@shared/models/appointement.model';
import { CalendarioService } from '../../../calendario/calendario.service';

@Component({
    selector: 'historial-cita',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './historial-cita.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialCitaComponent implements OnInit, OnChanges {
    private readonly _calendarioService = inject(CalendarioService);
    private readonly _cdr = inject(ChangeDetectorRef);

    public patientId = input<string>('');
    public isLoading = false;
    public errorMessage: string | null = null;

    public appointmentHistoryData: Array<{
        id: string;
        date: string;
        treatment: string;
        dentist: string;
        status: string;
        notes: string;
        cost: number;
        paid: boolean;
    }> = [];

    ngOnInit(): void {
        this.loadHistory();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['patientId'] && !changes['patientId'].firstChange) {
            this.loadHistory();
        }
    }

    private loadHistory(): void {
        if (!this.patientId()) {
            this.appointmentHistoryData = [];
            this.errorMessage = null;
            this._cdr.markForCheck();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this._calendarioService.getAppointments().subscribe({
            next: (appointments: Appointment[]) => {
                const patientAppointments = appointments
                    .filter(
                        (appointment) =>
                            appointment.patient?.id === this.patientId()
                    )
                    .map((appointment) => ({
                        id: appointment.id,
                        date: String(appointment.start_time),
                        treatment: appointment.treatment || 'Sin tratamiento',
                        dentist: appointment.dentist?.name || 'Sin asignar',
                        status: appointment.status,
                        notes: appointment.notes || '',
                        cost: 0,
                        paid: false,
                    }))
                    .sort(
                        (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                    );

                this.appointmentHistoryData = patientAppointments;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.appointmentHistoryData = [];
                this.errorMessage =
                    'No se pudo cargar el historial de citas del paciente.';
                this.isLoading = false;
                this._cdr.markForCheck();
            },
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
