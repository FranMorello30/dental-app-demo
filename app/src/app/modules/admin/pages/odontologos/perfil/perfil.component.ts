import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { format } from 'date-fns';

import { Schedules, Unavailability } from '@shared/models/dentist.model';
import { OdontologoService } from '../odontologos.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTabsModule, MatButtonModule],
    templateUrl: './perfil.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
    private readonly dentistService = inject(OdontologoService);
    public currentDate: Date = new Date();
    public dentist = {
        id: '7e2137d0-f565-4f52-883c-45f850ae78ad',
        name: 'Dra Eduarliannys Rodriguez',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        especiality: 'Ortodoncia',
    };
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
    public weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    public dateSelected: Date;

    ngOnInit(): void {
        this.dentistService.getSchedule(this.dentist.id).subscribe({
            next: (schedules) => {
                //this.dentist.schedules = schedules;
                console.log('Schedules fetched successfully:', schedules);
                this.schedules = schedules;
            },
            error: (error) => {
                console.error('Error fetching schedules:', error);
            },
        });
        this.dentistService.getUnavailability(this.dentist.id).subscribe({
            next: (schedules) => {
                this.navailabilities = schedules;
            },
            error: (error) => {
                console.error('Error fetching schedules:', error);
            },
        });
    }

    daysOfWeek(dayOfWeek: number): string {
        return this.days[dayOfWeek]?.label;
    }
    comparedDate(day: number) {
        if (!this.dateSelected) return false;
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
    getPastDay(day) {
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
    selectDate(day: number) {
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
        const dayOfWeek = date.getDay();
        return true;
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
}
