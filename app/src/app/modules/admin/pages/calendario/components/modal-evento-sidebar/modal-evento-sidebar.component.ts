import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Host,
    OnInit,
    Output,
    inject,
    input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Appointment } from '@shared/models/appointement.model';
import { AppointmentStatus } from '../../calendario.model';
import { CalendarioService } from '../../calendario.service';

import { OdontologoService } from '@modules/admin/pages/odontologos/odontologos.service';
import { UploadArchivoComponent } from '@shared/components/upload-archivo/upload-archivo.component';
import { CalendarioComponent } from '../../calendario.component';
import { OdontogramaSidebarComponent } from './odontograma/odontograma-sidebar.component';

@Component({
    selector: 'app-modal-evento-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        OdontogramaSidebarComponent,
        UploadArchivoComponent,
    ],
    templateUrl: './modal-evento-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ModalEventoSidebarComponent implements OnInit {
    ngOnInit(): void {
        // console.log('Selected Event:', this.selectedEvent());
    }
    private readonly _calendarioService = inject(CalendarioService);
    private readonly _odontologoService = inject(OdontologoService);
    private readonly _detectChange = inject(ChangeDetectorRef);

    @Host() private padre = inject(CalendarioComponent);

    selectedEvent = input.required<Appointment>();
    @Output() isClosed = new EventEmitter<void>();
    @Output() isExpandedSidebar = new EventEmitter<boolean>();
    @Output() changedEvent = new EventEmitter<void>();
    @Output() editEvent = new EventEmitter<Appointment>();
    isExpanded = false;
    activeView: 'habits' | 'odontogram' | 'uploads' = 'habits';
    uploadedAttachments: string[] = [];
    readonly edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];
    private readonly _futureRestricted: AppointmentStatus[] = [
        'En consulta',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];
    updatingStatus = false;
    rescheduleMode = false;
    rescheduling = false;
    rescheduleData: { date: Date | null; startTime: string; endTime: string } =
        {
            date: null,
            startTime: '',
            endTime: '',
        };
    private workingDays = new Set<number>();
    private scheduleLoaded = false;
    currentDate: Date = new Date();
    dateSelected: Date | null = null;
    weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    monthNames = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];
    timeSlots: string[] = this._generateTimeSlots(7, 20, 30);

    toggleExpand() {
        //console.log('Toggling sidebar expansion');
        this.isExpanded = !this.isExpanded;
        // this.isExpandedSidebar.emit(this.isExpanded);
    }

    setView(view: 'habits' | 'odontogram' | 'uploads') {
        this.activeView = view;
        if (!this.isExpanded) {
            this.isExpanded = true;
        }
        //  this.isExpandedSidebar.emit(this.isExpanded);
    }

    uploadFiles(files: string[]): void {
        this.uploadedAttachments = files;
        this._detectChange.detectChanges();
    }

    close() {
        this.isClosed.emit();
        //this.padre.closeDrawer();
    }

    reschedule() {
        // Implement reschedule logic or emit event
        console.log('Reschedule clicked');
    }

    cancelAppointment() {
        // Implement cancel logic
        console.log('Cancel clicked');
    }

    startEdit() {
        this.editEvent.emit(this.selectedEvent());
    }

    startReschedule() {
        const event = this.selectedEvent();
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);
        if (!this.scheduleLoaded && event.dentist?.id) {
            this._loadWorkingDays(event.dentist.id);
        }
        this.rescheduleData = {
            date: new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate()
            ),
            startTime: this._formatTime(startDate),
            endTime: this._formatTime(endDate),
        };
        this.currentDate = new Date(this.rescheduleData.date);
        this.dateSelected = new Date(this.rescheduleData.date);
        this.rescheduleMode = true;
    }

    cancelReschedule() {
        this.rescheduleMode = false;
        this.rescheduleData = { date: null, startTime: '', endTime: '' };
        this.dateSelected = null;
    }

    confirmReschedule() {
        if (
            !this.rescheduleData.date ||
            !this.rescheduleData.startTime ||
            !this.rescheduleData.endTime
        ) {
            return;
        }

        const startDate = this._combineDateAndTime(
            this.rescheduleData.date,
            this.rescheduleData.startTime
        );
        const endDate = this._combineDateAndTime(
            this.rescheduleData.date,
            this.rescheduleData.endTime
        );

        if (endDate.getTime() <= startDate.getTime()) {
            console.warn('End time must be after start time');
            return;
        }

        this.rescheduling = true;
        const event = this.selectedEvent();

        this._calendarioService
            .rescheduleAppointment(event.id, {
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
            })
            .subscribe({
                next: () => {
                    event.start_time = startDate;
                    event.end_time = endDate;
                    this.rescheduling = false;
                    this.rescheduleMode = false;
                    this.changedEvent.emit();
                },
                error: (err) => {
                    console.error('Error rescheduling:', err);
                    this.rescheduling = false;
                },
            });
    }

    getFormattedMonth(): string {
        return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    goToPrevious(): void {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(this.currentDate.getMonth() - 1);
        this.currentDate = newDate;
    }

    goToNext(): void {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(this.currentDate.getMonth() + 1);
        this.currentDate = newDate;
    }

    getMiniCalendarData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        return Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) =>
            i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
        );
    }

    isPastOrUnavailable(day: number | null): boolean {
        if (!day) return true;
        const date = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        if (date < today) return true;

        if (this.workingDays.size > 0 && !this.workingDays.has(date.getDay())) {
            return true;
        }

        return false;
    }

    isSelectedDay(day: number | null): boolean {
        if (!day || !this.dateSelected) return false;
        return (
            this.dateSelected.getDate() === day &&
            this.dateSelected.getMonth() === this.currentDate.getMonth() &&
            this.dateSelected.getFullYear() === this.currentDate.getFullYear()
        );
    }

    selectDate(day: number | null) {
        if (!day || this.isPastOrUnavailable(day)) return;
        this.dateSelected = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        this.rescheduleData.date = this.dateSelected;
    }

    private _generateTimeSlots(
        startHour: number,
        endHour: number,
        stepMinutes: number
    ): string[] {
        const slots: string[] = [];
        for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += stepMinutes) {
                const hours = h.toString().padStart(2, '0');
                const minutes = m.toString().padStart(2, '0');
                slots.push(`${hours}:${minutes}`);
            }
        }
        return slots;
    }

    private _combineDateAndTime(date: Date, time: string): Date {
        const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0);
        return combined;
    }

    private _loadWorkingDays(dentistId: string) {
        this._odontologoService.getSchedule(dentistId).subscribe({
            next: (schedules) => {
                this.workingDays = new Set(
                    schedules
                        .filter((s) => s.is_working_day)
                        .map((s) => s.day_of_week)
                );
                this.scheduleLoaded = true;
                this._detectChange.detectChanges();
            },
            error: (err) => {
                console.error('Error loading dentist schedule', err);
            },
        });
    }

    private _formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    getStatusColorClass(status: any): string {
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
                return 'bg-orange-500';
            default:
                return 'bg-blue-500';
        }
    }

    getAvailableStatuses(): AppointmentStatus[] {
        const event = this.selectedEvent();
        const startTime = new Date(event.start_time);
        const now = new Date();
        const isFuture = startTime.getTime() > now.getTime();

        if (isFuture) {
            return this.edoCitas.filter(
                (status) => !this._futureRestricted.includes(status)
            );
        }

        return this.edoCitas;
    }

    changeStatus(status: AppointmentStatus) {
        if (!status || status === this.selectedEvent().status) return;

        this.updatingStatus = true;
        this._calendarioService
            .updateAppointmentStatus(this.selectedEvent().id, status)
            .subscribe({
                next: () => {
                    this.selectedEvent().status = status;
                    this.updatingStatus = false;
                    this.changedEvent.emit();
                },
                error: (err) => {
                    console.error('Error updating status:', err);
                    this.updatingStatus = false;
                },
            });
    }

    private _toInputDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        const hours = `${date.getHours()}`.padStart(2, '0');
        const minutes = `${date.getMinutes()}`.padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}
