import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    viewChild,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { format } from 'date-fns';

import {
    animate,
    group,
    query,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Appointment } from '@shared/models/appointement.model';
import { Dentist } from '@shared/models/dentist.model';
import { AppointmentStatus } from './calendario.model';
import { CalendarioService } from './calendario.service';
import { ModalDetalleComponent } from './components/modal-detalle/modal-detalle.component';
import { ModalEventoSidebarComponent } from './components/modal-evento-sidebar/modal-evento-sidebar.component';
import { ModalEventoComponent } from './components/modal-evento/modal-evento.component';
import { ModalRegistroComponent } from './components/modal-registro/modal-registro.component';
import { SidebarRegistroComponent } from './components/sidebar-registro/sidebar-registro.component';

@Component({
    selector: 'app-calendario',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        ModalRegistroComponent,
        ModalEventoComponent,
        ModalDetalleComponent,
        ModalEventoSidebarComponent,
        SidebarRegistroComponent,
        FormsModule,
    ],
    templateUrl: './calendario.component.html',

    // calendario.component.ts
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                // Estado inicial: Panel fuera a la derecha y fondo transparente
                style({ opacity: 0 }),
                group([
                    animate('300ms ease-out', style({ opacity: 1 })),
                    query('.sidebar-panel', [
                        style({ transform: 'translateX(100%)' }),
                        animate(
                            '300ms ease-out',
                            style({ transform: 'translateX(0%)' })
                        ),
                    ]),
                ]),
            ]),
            transition(':leave', [
                group([
                    animate('300ms ease-in', style({ opacity: 0 })),
                    query('.sidebar-panel', [
                        animate(
                            '300ms ease-in',
                            style({ transform: 'translateX(100%)' })
                        ),
                    ]),
                ]),
            ]),
        ]),
        trigger('popoverAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate(
                    '100ms ease-out',
                    style({ opacity: 1, transform: 'scale(1)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '75ms ease-in',
                    style({ opacity: 0, transform: 'scale(0.95)' })
                ),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CalendarioComponent implements OnInit, OnDestroy {
    readonly matDrawer = viewChild<MatDrawer>('matDrawer');

    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _calendarioService = inject(CalendarioService);

    currentView: 'day' | 'week' | 'month' = 'week';
    currentDate: Date = new Date();

    // Message popup state
    activeMessageEventId: string | null = null;
    customMessage: string = '';

    dentistAvailability = {
        availableDays: [0, 1, 2, 3, 4, 5, 6], // Lunes a Viernes

        // Horarios disponibles por día
        // Las horas están en formato 24h
        availableHours: {
            1: {
                // Lunes
                enabled: true,
                start: '09:00',
                end: '17:00',
                breaks: [
                    { start: '12:00', end: '12:30' }, // Almuerzo modificado
                ],
            },
            2: {
                // Martes
                enabled: true,
                start: '09:00',
                end: '17:00',
                breaks: [
                    { start: '12:00', end: '12:30' }, // Almuerzo modificado
                ],
            },
            3: {
                // Miércoles
                enabled: true,
                start: '09:00',
                end: '17:00',
                breaks: [
                    { start: '12:00', end: '12:30' }, // Almuerzo modificado
                ],
            },
            4: {
                // Jueves
                enabled: true,
                start: '09:00',
                end: '17:00',
                breaks: [
                    { start: '12:00', end: '12:30' }, // Almuerzo modificado
                ],
            },
            5: {
                // Viernes
                enabled: true,
                start: '09:00',
                end: '15:00', // Viernes sale más temprano
                breaks: [
                    { start: '12:00', end: '12:30' }, // Almuerzo modificado
                ],
            },
        },
    };
    wSidebar = 'w-160'; // Clase CSS para el ancho del sidebar
    // Extended time slots from 7 AM to 5 PM
    timeSlots = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
    public diasMini = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    public diasHeaderMes = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    public weeks: any[] = [];
    public allEvents: Appointment[] = [];
    public dayEvents: Appointment[] = [];
    public diasemanas: any[] = [];
    public selectedEvent: Appointment = null;
    public editingEvent: Appointment = null;
    public eventPending: Appointment = null;
    public editingStatus = false;
    public edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];
    public dentists: Dentist[] = [];

    public registerEvent = false;
    errors;
    timeSlotsForm = [
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
    ];
    public selectedDate: Date;
    public selectDentist = new FormControl();
    public dentist: Dentist;

    public showMore = false;
    public moreDay: number = null;

    public currentTime: Date = new Date();
    private _timeInterval: any;

    ngOnInit(): void {
        // this.appointmentService.getAppointments().subscribe((appointments) => {
        //     this.appointments = appointments;
        // });
        this.getMonthCalendarData();
        this.getWeekDates();
        this._getDentist();
        this.getAppointments();
        this.selectDentist.valueChanges.subscribe((dentistId: Dentist) => {
            if (dentistId) {
                this._getDentistAvailability(dentistId);
            }
        });

        // Actualizar la hora cada segundo
        this._timeInterval = setInterval(() => {
            this.currentTime = new Date();
            this._detectChange.markForCheck();
        }, 1000);

        // this.getFilteredEvents();
    }

    ngOnDestroy(): void {
        this._toggleBodyScroll(false);
        if (this._timeInterval) {
            clearInterval(this._timeInterval);
        }
    }
    getCurrentDate() {
        this.currentDate = new Date();
        this.weeks = [];
        this.getMonthCalendarData();
        this.getWeekDates();
        // this.getFilteredEvents();
    }
    getFormattedDate(): string {
        return format(this.currentDate, 'MMMM yyyy');
    }
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        // Verificar si es una fecha pasada
        if (compareDate < today) {
            return true;
        }

        // Verificar si el día está disponible según el horario del odontólogo
        return !this.isDayAvailable(compareDate);
    }
    isDayAvailable(date: Date): boolean {
        const config = this.loadAvailability();
        const dayOfWeek = date.getDay();
        let available = config.availableDays.includes(dayOfWeek);

        if (
            this.dentist &&
            this.dentist.unavailabilities &&
            this.dentist.unavailabilities.length > 0
        ) {
            const dateToCheck = new Date(date);

            dateToCheck.setHours(0, 0, 0, 0);
            const isUnavailable = this.dentist.unavailabilities.some((u) => {
                const unavailDate = new Date(u.unavailable_date + 'T00:00:00');

                unavailDate.setHours(0, 0, 0, 0);
                return unavailDate.getTime() === dateToCheck.getTime();
            });
            available = available && !isUnavailable;
        }
        return available;
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
    getMiniCalendarData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

        return Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) =>
            i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
        );
    }
    getFilteredEvents() {
        const weekDates = this.diasemanas;

        if (this.currentView === 'day') {
            return (this.dayEvents = this.allEvents.filter(
                (event) =>
                    event.start_time.getDate() === this.currentDate.getDate() &&
                    event.start_time.getMonth() ===
                        this.currentDate.getMonth() &&
                    event.start_time.getFullYear() ===
                        this.currentDate.getFullYear()
            ));
        } else if (this.currentView === 'week') {
            const weekStart = weekDates[0];
            const weekEnd = weekDates[6];

            return (this.dayEvents = this.allEvents.filter(
                (event) =>
                    event.start_time >= weekStart && event.start_time <= weekEnd
            ));
        } else if (this.currentView === 'month') {
            //console.log('Current Month:', this.allEvents);

            //"start_time": "2025-06-18T14:00:00.000Z",
            //"end_time": "2025-06-18T14:30:00.000Z",
            // this.allEvents.map((event) => {
            //     event.start_time = new Date(event.start_time);
            //     event.end_time = new Date(event.end_time);
            //     // console.log('Event Start Time:', event.start_time);
            //     // console.log('Event End Time:', event.end_time);
            // });

            return (this.dayEvents = this.allEvents.filter(
                (event) =>
                    event.start_time.getMonth() ===
                        this.currentDate.getMonth() &&
                    event.start_time.getFullYear() ===
                        this.currentDate.getFullYear()
            ));
        }

        return this.dayEvents;
    }
    /******************************************************************* */
    getMonthCalendarData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

        const days = Array.from({ length: 42 }, (_, i) => {
            if (i < firstDayOfMonth || i >= firstDayOfMonth + daysInMonth) {
                return null;
            }
            return i - firstDayOfMonth + 1;
        });
        // const days = Array.from(
        //     { length: daysInMonth + firstDayOfMonth },
        //     (_, i) => (i < firstDayOfMonth ? null : i - firstDayOfMonth + 1)
        // );

        for (let i = 0; i < days.length; i += 7) {
            this.weeks.push(days.slice(i, i + 7));
        }
    }
    getEventsByMonth(day: number) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        return this.allEvents
            .filter(
                (event) =>
                    event.start_time.getDate() === day &&
                    event.start_time.getMonth() === month &&
                    event.start_time.getFullYear() === year
            )
            .sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    }
    isWeekDayAvailable(day) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const date = new Date(year, month, day);

        const isCurrentDate =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();
        // console.warn(this.isDayAvailable(date));

        return this.isDayAvailable(date);
    }
    changeMonth(num: number): void {
        if (num === -1) {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        // const currentMonth = this.currentDate.getMonth();
        // const currentYear = this.currentDate.getFullYear();

        // if (currentMonth === 11) {
        //     this.currentDate.setFullYear(currentYear + 1);
        //     this.currentDate.setMonth(0); // Enero
        // } else {
        //     this.currentDate.setMonth(currentMonth + 1);
        // }
        this.weeks = [];
        this.getMonthCalendarData();
    }
    goToPrevious(): void {
        //console.log(this.currentView);
        const newDate = new Date(this.currentDate);
        if (this.currentView === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (this.currentView === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (this.currentView === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        this.currentDate = newDate;
        this.weeks = [];
        this.getMonthCalendarData();
        this.getWeekDates();
        this.getFilteredEvents();
    }
    goToNext() {
        const newDate = new Date(this.currentDate);
        if (this.currentView === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        } else if (this.currentView === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (this.currentView === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        this.currentDate = newDate;
        this.weeks = [];
        this.getMonthCalendarData();
        this.getWeekDates();
        this.getFilteredEvents();
    }
    /************************************************************************/
    getEventsByWeek(date: Date) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const eve = this.allEvents.filter(
            (event) =>
                event.start_time.getDate() === date.getDate() &&
                event.start_time.getMonth() === date.getMonth() &&
                event.start_time.getFullYear() === date.getFullYear()
        );

        //console.log('Events by week:', eve);
        return eve;
    }
    compareDate(date) {
        const isCurrentDate =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

        return isCurrentDate;
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
    getWeekDates() {
        const date = new Date(this.currentDate);
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Calculate the start of the week (Sunday)
        date.setDate(date.getDate() - day);

        // Generate array of dates for the week
        this.diasemanas = Array.from({ length: 7 }, (_, i) => {
            const weekDate = new Date(date);
            weekDate.setDate(date.getDate() + i);
            return weekDate;
        });
    }
    calculateEventStyle(startTime: Date, endTime: Date) {
        // Extraer horas y minutos
        //console.error(startTime, endTime);

        const startTimeStr = startTime.toTimeString().split(' ')[0]; // "HH:MM:SS"
        const endTimeStr = endTime.toTimeString().split(' ')[0]; // "

        //console.log(startTimeStr, endTimeStr);

        const [startHour, startMinute] = startTimeStr.split(':').map(Number);
        const [endHour, endMinute] = endTimeStr.split(':').map(Number);

        //console.warn({ startHour, startMinute, endHour, endMinute });

        // Convertir a decimal (8:00 = 0, 9:00 = 1, etc.)
        const startDecimal = startHour - 8 + startMinute / 60;
        const endDecimal = endHour - 8 + endMinute / 60;

        // Calcular posición y altura (80px por hora)
        const top = startDecimal * 80;
        const height = (endDecimal - startDecimal) * 80;

        // console.log('Top:', top, 'Height:', height);

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: '4px',
            right: '4px',
        };
    }

    getCurrentTimePosition(): string {
        const now = this.currentTime;
        const startHour = 8; // Hora de inicio del calendario
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const decimal = currentHour - startHour + currentMinute / 60;
        const top = decimal * 80; // 80px por hora
        return `${top}px`;
    }

    getEventDurationMinutes(event: Appointment): number {
        return (
            (new Date(event.end_time).getTime() -
                new Date(event.start_time).getTime()) /
            60000
        );
    }

    hasSpaceForPatient(event: Appointment): boolean {
        return this.getEventDurationMinutes(event) >= 60;
    }
    /*************************************************************** */
    onSlotHourClick(date: Date, hour: number, event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }

        if (!this.dentist) {
            return;
        }

        const targetDate = new Date(date);
        targetDate.setHours(hour, 0, 0, 0);

        if (this.isPastDate(targetDate) || !this.isDayAvailable(targetDate)) {
            return;
        }

        this.crearCita(targetDate);
    }

    crearCita(day?: number | Date) {
        if (!this.dentist) {
            return;
        }

        let targetDate: Date;

        if (day instanceof Date) {
            targetDate = new Date(day);
        } else if (typeof day === 'number') {
            targetDate = new Date(this.currentDate);
            targetDate.setDate(day);
        } else {
            targetDate = new Date(this.currentDate);
        }

        this.selectedDate = targetDate;
        this.registerEvent = true;
    }

    handleMiniDayClick(day: number | null) {
        if (!day || !this.dentist) {
            return;
        }

        const date = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );

        if (this.isPastDate(date) || !this.isDayAvailable(date)) {
            return;
        }

        this.crearCita(date);
    }

    onSlotClick(date: Date, event: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }

        if (!this.dentist) {
            return;
        }

        if (this.isPastDate(date) || !this.isDayAvailable(date)) {
            return;
        }

        this.crearCita(date);
    }

    onViewChange(view: 'day' | 'week' | 'month'): void {
        this.currentView = view;
    }
    getStatusColor(status: string): string {
        switch (status) {
            case 'Sin confirmar':
                return 'bg-yellow-500';
            case 'Confirmada':
                return 'bg-green-600';
            case 'En consulta':
                return 'bg-purple-600';
            case 'Cancelada':
                return 'bg-red-600';
            case 'Finalizada':
                return 'bg-gray-600';
            case 'Finalizada (Pendiente)':
                return 'bg-orange-500'; // Color distintivo para citas finalizadas pendientes de documentación
            default:
                return 'bg-blue-600';
        }
    }
    totByStatus(status: AppointmentStatus) {
        return this.allEvents.filter(
            (event) =>
                event.start_time.getMonth() === this.currentDate.getMonth() &&
                event.start_time.getFullYear() ===
                    this.currentDate.getFullYear() &&
                event.status === status
        ).length;
    }
    loadAvailability() {
        // console.log('Dentist Availability:', this.dentistAvailability);
        return this.dentistAvailability;
    }
    openEvent(event: Appointment) {
        this.editingEvent = null;
        this.selectedEvent = event;
        console.log('Selected Event:', event);
        this._toggleBodyScroll(true);
        this._detectChange.detectChanges();
        // this.matDrawer().open();
    }
    mostrarSubSidebar(isExpanded: boolean) {
        console.warn('Sidebar expanded:', isExpanded);
        if (isExpanded) {
            this.wSidebar = 'w-240'; // Ancho ampliado
        } else {
            this.wSidebar = 'w-160'; // Ancho original
        }
        this._detectChange.detectChanges();
    }
    closeDrawer() {
        this.matDrawer().close();
        this.selectedEvent = null;
        this._toggleBodyScroll(false);
    }

    startEditEvent(event: Appointment) {
        this.closeSelectedEvent();
        this.editingEvent = event;
    }

    eventDetails(event: Appointment) {
        this.eventPending = event;
    }

    public getAppointments() {
        this._calendarioService.getAppointments().subscribe({
            next: (response) => {
                //console.log('Appointments:', response);
                response.forEach((appointment) => {
                    appointment.start_time = new Date(appointment.start_time);
                    appointment.end_time = new Date(appointment.end_time);
                });
                this.allEvents = response;
                this.getFilteredEvents();
                this._detectChange.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching appointments:', error);
            },
        });
    }
    private _getDentistAvailability(dentist: Dentist) {
        this.dentist = dentist;

        const days = dentist.schedules.map((schedule) => {
            return schedule.is_working_day ? schedule.day_of_week : null;
        });

        this.dentistAvailability.availableDays = days;
        // this._calendarioService.getDentistAvailability(dentistId).subscribe({
        //     next: (response) => {
        //         console.log('Dentist Availability:', response);
        //         this.dentistAvailability = response;
        //     },
        //     error: (error) => {
        //         console.error('Error fetching dentist availability:', error);
        //     },
        // });
    }
    private _getDentist() {
        this._calendarioService.getAllDentists().subscribe({
            next: (response) => {
                this.dentists = response;
                this._detectChange.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching dentists:', error);
            },
        });
    }
    openMoreEvents(day: number) {
        this.moreDay = day;
        this.showMore = true;
    }

    closeMore() {
        this.showMore = false;
        this.moreDay = null;
        this.selectedDate = null;
        this.registerEvent = false;
        this.closeSelectedEvent();
    }

    closeRegisterSidebar(): void {
        this.registerEvent = false;
        this.selectedDate = null;
        this._toggleBodyScroll(false);
    }

    handleAppointmentCreated(): void {
        this.registerEvent = false;
        this.selectedDate = null;
        this.getAppointments();
        this._toggleBodyScroll(false);
    }

    getDayHeader(year: number, month: number, day: number): string {
        if (day == null) return '';
        const date = new Date(year, month, day);
        const index = (date.getDay() + 6) % 7;
        return this.diasHeaderMes[index];
    }

    closeSelectedEvent(): void {
        if (this.selectedEvent) {
            this._toggleBodyScroll(false);
        }
        this.selectedEvent = null;
    }

    toggleMessageInput(eventId: string, event: Event) {
        event.stopPropagation();
        if (this.activeMessageEventId === eventId) {
            this.activeMessageEventId = null;
            this.customMessage = '';
        } else {
            this.activeMessageEventId = eventId;
            this.customMessage = '';
        }
    }

    sendCustomMessage(appointment: Appointment) {
        if (!appointment.patient.phone) return;
        const cleanPhone = appointment.patient.phone.replace(/[^\d+]/g, '');
        const message =
            this.customMessage ||
            `Hola ${appointment.patient.name}, le escribimos de Dental Care acerca de su cita programada para el ${appointment.start_time}.`;

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        this.activeMessageEventId = null;
        this.customMessage = '';
    }

    closeMessageInput(event: Event) {
        event.stopPropagation();
        this.activeMessageEventId = null;
        this.customMessage = '';
    }

    private _toggleBodyScroll(disable: boolean): void {
        document.body.style.overflow = disable ? 'hidden' : '';
    }
}
