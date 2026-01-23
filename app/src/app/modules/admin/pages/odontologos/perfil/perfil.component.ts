import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { format } from 'date-fns';
import { forkJoin, of } from 'rxjs';

import {
    Dentist,
    Schedules,
    Unavailability,
} from '@shared/models/dentist.model';
import { OdontologoService } from '../odontologos.service';

interface BreakDraft {
    start_time: string;
    end_time: string;
}

interface ScheduleDraft {
    day_of_week: number;
    label: string;
    is_working_day: boolean;
    start_time: string;
    end_time: string;
    breaks: BreakDraft[];
}

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatTabsModule,
        MatButtonModule,
    ],
    templateUrl: './perfil.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
    private readonly dentistService = inject(OdontologoService);
    private readonly route = inject(ActivatedRoute);
    private readonly cdr = inject(ChangeDetectorRef);
    public currentDate: Date = new Date();
    public dentist: Dentist | null = null;
    public loading = false;
    public errorMessage: string | null = null;
    public days = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
    ];
    public totales = {
        patientsCount: 247,
        appointmentsCompleted: 1254,
        satisfactionRate: 96,
        upcomingAppointments: 8,
    };
    public schedules: Schedules[] = [];
    public navailabilities: Unavailability[] = [];
    public editingSchedule = false;
    public scheduleSaving = false;
    public scheduleDrafts: ScheduleDraft[] = [];
    public weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    public dateSelected: Date;
    private readonly defaultStart = '08:00';
    private readonly defaultEnd = '17:00';

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadDentist(id);
        } else {
            this.errorMessage = 'No se encontró el odontólogo solicitado.';
        }
    }

    private loadDentist(id: string): void {
        this.loading = true;
        this.errorMessage = null;
        this.dentistService.getDentist(id).subscribe({
            next: (dentist) => {
                this.dentist = dentist;
                this.schedules = dentist.schedules ?? [];
                this.navailabilities = dentist.unavailabilities ?? [];
                if (!this.editingSchedule) {
                    this.scheduleDrafts = this.buildScheduleDrafts();
                }
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.errorMessage =
                    'No se pudo cargar el perfil del odontólogo.';
                this.cdr.markForCheck();
            },
        });
    }

    daysOfWeek(dayOfWeek: number): string {
        return this.days[dayOfWeek]?.label;
    }

    toggleScheduleEdit(): void {
        if (this.editingSchedule) {
            this.editingSchedule = false;
            this.scheduleDrafts = this.buildScheduleDrafts();
            this.cdr.markForCheck();
            return;
        }
        this.editingSchedule = true;
        this.scheduleDrafts = this.buildScheduleDrafts();
        this.cdr.markForCheck();
    }

    cancelScheduleEdit(): void {
        this.editingSchedule = false;
        this.scheduleDrafts = this.buildScheduleDrafts();
        this.cdr.markForCheck();
    }

    addBreak(dayIndex: number): void {
        const draft = this.scheduleDrafts[dayIndex];
        if (!draft) return;
        draft.breaks.push({ start_time: '', end_time: '' });
        this.cdr.markForCheck();
    }

    removeBreak(dayIndex: number, breakIndex: number): void {
        const draft = this.scheduleDrafts[dayIndex];
        if (!draft) return;
        draft.breaks.splice(breakIndex, 1);
        this.cdr.markForCheck();
    }

    saveScheduleChanges(): void {
        if (!this.dentist || this.scheduleSaving) return;
        const dentistId = this.dentist.id;

        const payload = this.scheduleDrafts.map((item) => ({
            dentistId,
            day_of_week: item.day_of_week,
            is_working_day: item.is_working_day,
            start_time: this.normalizeTime(
                item.start_time || this.defaultStart
            ),
            end_time: this.normalizeTime(item.end_time || this.defaultEnd),
        }));

        this.scheduleSaving = true;
        this.dentistService.replaceSchedules(dentistId, payload).subscribe({
            next: (schedules) => {
                const breakRequests = schedules.flatMap((schedule) => {
                    const draft = this.scheduleDrafts.find(
                        (item) => item.day_of_week === schedule.day_of_week
                    );
                    if (!draft?.is_working_day || !draft.breaks.length) {
                        return [];
                    }
                    return draft.breaks
                        .filter((b) => b.start_time && b.end_time)
                        .map((b) =>
                            this.dentistService.createBreak({
                                scheduleId: schedule.id,
                                start_time: this.normalizeTime(b.start_time),
                                end_time: this.normalizeTime(b.end_time),
                            })
                        );
                });

                const requests$ = breakRequests.length
                    ? forkJoin(breakRequests)
                    : of([]);

                requests$.subscribe({
                    next: () => {
                        this.editingSchedule = false;
                        this.scheduleSaving = false;
                        this.loadDentist(dentistId);
                    },
                    error: () => {
                        this.scheduleSaving = false;
                        this.cdr.markForCheck();
                    },
                });
            },
            error: () => {
                this.scheduleSaving = false;
                this.cdr.markForCheck();
            },
        });
    }
    comparedDate(day: number | null) {
        if (!this.dateSelected || day === null) return false;
        return (
            this.dateSelected.getDate() === day &&
            this.dateSelected.getMonth() === this.currentDate.getMonth() &&
            this.dateSelected.getFullYear() === this.currentDate.getFullYear()
        );
    }
    goToPrevious(): void {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        this.currentDate = newDate;
        this.getMiniCalendarData();
    }
    goToNext() {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        this.currentDate = newDate;
        this.getMiniCalendarData();
    }
    getFormattedDate(): string {
        return format(this.currentDate, 'MMMM yyyy');
    }
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }
    getPastDay(day: number | null) {
        if (day === null) return true;
        const date = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        const isCurrentDay =
            day === this.currentDate.getDate() &&
            this.currentDate.getMonth() === new Date().getMonth() &&
            this.currentDate.getFullYear() === new Date().getFullYear();

        return this.isPastDate(date);
    }
    getFormattedDateForDay(day) {
        const d = new Date(day + 'T00:00:00');
        return d.toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }
    selectDate(day: number | null) {
        if (day === null) return;
        const newDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        this.dateSelected = newDate;
    }
    isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate < today) {
            return true;
        }
        return !this.isDayAvailable(compareDate);
    }
    isDayAvailable(date: Date): boolean {
        if (!this.schedules.length) return false;
        const dayOfWeek = date.getDay();
        const workingDay = this.schedules.some(
            (schedule) =>
                schedule.day_of_week === dayOfWeek && schedule.is_working_day
        );
        if (!workingDay) return false;

        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        const isUnavailable = this.navailabilities.some((u) => {
            const unavailDate = new Date(u.unavailable_date as any);
            unavailDate.setHours(0, 0, 0, 0);
            return unavailDate.getTime() === dateToCheck.getTime();
        });

        return !isUnavailable;
    }
    getMiniCalendarData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

        return Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) =>
            i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
        );
    }

    get specialties(): string[] {
        const raw = this.dentist?.specialty ?? '';
        return raw
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item);
    }

    formatProfileDate(value?: string | Date): string {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return format(date, 'dd/MM/yyyy');
    }

    formatTime(value?: string): string {
        if (!value) return '—';
        const [hours, minutes] = value.split(':');
        if (!hours || minutes === undefined) return value;
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    private normalizeTime(value: string): string {
        if (!value) return this.defaultStart;
        const [hours, minutes] = value.split(':');
        if (!hours || minutes === undefined) return value;
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    private buildScheduleDrafts(): ScheduleDraft[] {
        return this.days.map((day) => {
            const schedule = this.schedules.find(
                (item) => item.day_of_week === day.value
            );
            return {
                day_of_week: day.value,
                label: day.label,
                is_working_day: schedule?.is_working_day ?? false,
                start_time: this.normalizeTime(
                    schedule?.start_time || this.defaultStart
                ),
                end_time: this.normalizeTime(
                    schedule?.end_time || this.defaultEnd
                ),
                breaks:
                    schedule?.breaks?.map((b) => ({
                        start_time: this.normalizeTime(b.start_time),
                        end_time: this.normalizeTime(b.end_time),
                    })) ?? [],
            };
        });
    }
}
