import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { format } from 'date-fns';
import { AppointmentStatus } from '../../calendario/calendario.model';
import { HistorialCitaComponent } from './historial-cita/historial-cita.component';
import { OdontogramaComponent } from './odontograma/odontograma.component';
import { PlanTratamientoComponent } from './plan-tratamiento/plan-tratamiento.component';
@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatTabsModule,
        MatButtonModule,
        OdontogramaComponent,
        PlanTratamientoComponent,
        HistorialCitaComponent,
    ],
    templateUrl: './perfil.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
    public registerEvent = false;
    currentDate: Date = new Date();
    year = this.currentDate.getFullYear();
    month = this.currentDate.getMonth();
    firstDay = new Date(this.year, this.month, 1).getDay();
    daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    today = new Date();
    days = [];
    dateSelected: Date;
    //today.setHours(0, 0, 0, 0)
    dentistAvailability = {
        availableDays: [1, 3, 5], // Lunes a Viernes

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
    weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    isSelected = false;
    // Nombres de los meses
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
    public edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];
    public tratamientos = [
        'Revisión General',
        'Limpieza Dental Profunda',
        'Empaste Simple',
        'Empaste Complejo',
        'Extracción Simple',
        'Extracción Quirúrgica',
        'Tratamiento de Conducto',
        'Corona Dental',
        'Blanqueamiento Dental',
        'Ortodoncia - Consulta Inicial',
    ];
    patient = {
        id: 1,
        name: 'Francisco Morello',
        email: 'jose19francisco@gmail.com',
        phone: '(58) 424-436-8567',
        address: 'Resiendias Rio Caroni II Sector Paraparal',
        dateOfBirth: '1990-02-26',
        lastAppointment: '2025-03-15', // Fecha de última consulta
        nextAppointment: '2025-05-20', // Fecha de próxima consulta
        insurance: 'No registrado',
        insuranceId: 'No registrado',
    };

    // Sample treatment plans

    // Sample medical history records
    medicalHistoryData = [
        {
            id: 1,
            date: '2025-03-15',
            type: 'Examen periódico',
            description: 'Examen dental completo con radiografías',
            findings:
                'Salud dental general buena. No se detectaron nuevas caries.',
            recommendations:
                'Continuar con higiene dental habitual. Próxima revisión en 6 meses.',
            dentist: 'Dr. María García',
            attachments: [
                {
                    id: 1,
                    name: 'Radiografía panorámica',
                    type: 'image',
                    url: '#',
                },
                { id: 2, name: 'Informe dental', type: 'pdf', url: '#' },
            ],
        },
        {
            id: 2,
            date: '2025-01-20',
            type: 'Procedimiento',
            description: 'Extracción de muela del juicio inferior derecha',
            findings:
                'Extracción sin complicaciones. Buen pronóstico de cicatrización.',
            recommendations:
                'Dieta blanda por 48 horas. Analgésicos según prescripción. Revisión en 2 semanas.',
            dentist: 'Dr. Carlos Ruiz',
            attachments: [
                { id: 1, name: 'Radiografía previa', type: 'image', url: '#' },
                { id: 2, name: 'Prescripción', type: 'pdf', url: '#' },
            ],
        },
        {
            id: 3,
            date: '2024-11-05',
            type: 'Diagnóstico',
            description: 'Revisión y diagnóstico de dolor en zona molar',
            findings:
                'Se detecta caries incipiente en molar inferior derecho. No hay afectación pulpar.',
            recommendations:
                'Programar tratamiento de caries. Reforzar higiene en zona molar.',
            dentist: 'Dr. María García',
            attachments: [
                {
                    id: 1,
                    name: 'Radiografía de diagnóstico',
                    type: 'image',
                    url: '#',
                },
            ],
        },
        {
            id: 4,
            date: '2024-08-12',
            type: 'Procedimiento',
            description: 'Empaste en molar inferior derecho',
            findings: 'Caries de profundidad media. No hubo exposición pulpar.',
            recommendations:
                'Evitar alimentos duros por 24 horas. Mantener higiene regular.',
            dentist: 'Dr. Carlos Ruiz',
            attachments: [],
        },
    ];

    dientesTratados = [
        { toothNumber: 18, treatmentId: 'extraction' },
        { toothNumber: 36, treatmentId: 'filling' },
        { toothNumber: 46, treatmentId: 'caries' },
        { toothNumber: 26, treatmentId: 'crown' },
    ];
    // Sample payment history
    paymentHistoryData = [
        {
            id: 1,
            date: '2025-03-15',
            amount: 80.0,
            method: 'Tarjeta de crédito',
            description: 'Pago por limpieza dental',
            invoice: 'INV-2025-001',
        },
        {
            id: 2,
            date: '2025-01-20',
            amount: 150.0,
            method: 'Efectivo',
            description: 'Pago por extracción dental',
            invoice: 'INV-2025-002',
        },
        {
            id: 3,
            date: '2025-01-05',
            amount: 500.0,
            method: 'Transferencia',
            description: 'Primer pago tratamiento ortodoncia',
            invoice: 'INV-2025-003',
        },
        {
            id: 4,
            date: '2024-12-15',
            amount: 500.0,
            method: 'Transferencia',
            description: 'Depósito inicial tratamiento ortodoncia',
            invoice: 'INV-2024-045',
        },
        {
            id: 5,
            date: '2024-11-05',
            amount: 50.0,
            method: 'Tarjeta de débito',
            description: 'Pago por revisión',
            invoice: 'INV-2024-040',
        },
        {
            id: 6,
            date: '2024-08-12',
            amount: 95.0,
            method: 'Efectivo',
            description: 'Pago por empaste dental',
            invoice: 'INV-2024-032',
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
    formatMonth(date: string) {
        const dateObj = new Date(date);

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        };
        return dateObj.toLocaleDateString('es-ES', options);
    }
    getEdad() {
        return Math.floor(
            (new Date().getTime() -
                new Date(this.patient.dateOfBirth).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
        );
    }
    crearCita() {
        this.registerEvent = true;
    }
    cerrarFormCita() {
        this.registerEvent = false;
    }

    /******************************************************************************* */
    getFormattedDate(): string {
        return format(this.currentDate, 'MMMM yyyy');
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
    selectDate = (day: number) => {
        const newDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );

        this.dateSelected = newDate;

        console.log('Selected date:', newDate);

        // if (onDateChange) {
        //   onDateChange(newDate)
        // }
    };
    comparedDate(day: number) {
        if (!this.dateSelected) return false;
        return (
            this.dateSelected.getDate() === day &&
            this.dateSelected.getMonth() === this.currentDate.getMonth() &&
            this.dateSelected.getFullYear() === this.currentDate.getFullYear()
        );
    }
    isDayAvailable(date: Date): boolean {
        const config = this.loadAvailability();
        const dayOfWeek = date.getDay();
        return config.availableDays.includes(dayOfWeek);
    }
    loadAvailability() {
        // console.log('Dentist Availability:', this.dentistAvailability);
        return this.dentistAvailability;
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
