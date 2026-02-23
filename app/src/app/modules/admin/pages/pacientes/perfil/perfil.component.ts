import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { MedicalHistory } from '@shared/models/appointement.model';
import { Paciente } from '@shared/models/pacientes.model';
import { TreatmentPlan } from '@shared/models/treatment-plan.model';
import { format } from 'date-fns';
import { AppointmentStatus } from '../../calendario/calendario.model';
import { PacienteService } from '../pacientes.service';
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
export class PerfilComponent implements OnInit {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _pacienteService = inject(PacienteService);
    private readonly _cdr = inject(ChangeDetectorRef);

    public registerEvent = false;
    public patientId =
        this._activatedRoute.snapshot.paramMap.get('id') ||
        this._activatedRoute.parent?.snapshot.paramMap.get('id') ||
        '';
    public isLoadingPatient = false;
    public patientError: string | null = null;
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
        'En espera',
        'En consulta',
        'Ausente',
        'Pendiente de pago',
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
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        lastAppointment: null as string | null,
        nextAppointment: null as string | null,
        insurance: 'No registrado',
        insuranceId: 'No registrado',
    };
    public medicalHistoryData: MedicalHistory[] = [];
    public isLoadingMedicalHistory = false;
    public medicalHistoryError: string | null = null;
    public billingPlans: TreatmentPlan[] = [];
    public isLoadingBilling = false;
    public billingError: string | null = null;

    dientesTratados = [
        { toothNumber: 18, treatmentId: 'extraction' },
        { toothNumber: 36, treatmentId: 'filling' },
        { toothNumber: 46, treatmentId: 'caries' },
        { toothNumber: 26, treatmentId: 'crown' },
    ];

    ngOnInit(): void {
        this.loadPatient();
        this.loadMedicalHistory();
        this.loadBillingData();
    }

    private loadPatient(): void {
        if (!this.patientId) {
            this.patientError = 'No se encontró el paciente solicitado.';
            this._cdr.markForCheck();
            return;
        }

        this.isLoadingPatient = true;
        this.patientError = null;

        this._pacienteService.getPatientById(this.patientId).subscribe({
            next: (patient: Paciente & { insurance_id?: string }) => {
                this.patient = {
                    id: patient.id,
                    name: patient.name || '',
                    email: patient.email || '',
                    phone: patient.phone || '',
                    address: patient.address || '',
                    dateOfBirth: patient.date_of_birth || '',
                    lastAppointment: patient.last_appointment,
                    nextAppointment: patient.next_appointment,
                    insurance: patient.insurance || 'No registrado',
                    insuranceId: patient.insurance_id || 'No registrado',
                };
                this.isLoadingPatient = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.patientError =
                    'No se pudo cargar la información del paciente.';
                this.isLoadingPatient = false;
                this._cdr.markForCheck();
            },
        });
    }

    private loadMedicalHistory(): void {
        if (!this.patientId) {
            this.medicalHistoryError =
                'No se encontró el paciente para cargar su historia clínica.';
            this._cdr.markForCheck();
            return;
        }

        this.isLoadingMedicalHistory = true;
        this.medicalHistoryError = null;

        this._pacienteService.getMedicalHistories().subscribe({
            next: (
                histories: Array<MedicalHistory & { patient?: { id: string } }>
            ) => {
                this.medicalHistoryData = histories
                    .filter((history) => history.patient?.id === this.patientId)
                    .sort(
                        (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                    );
                this.isLoadingMedicalHistory = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.medicalHistoryError =
                    'No se pudo cargar la historia clínica del paciente.';
                this.isLoadingMedicalHistory = false;
                this._cdr.markForCheck();
            },
        });
    }

    private loadBillingData(): void {
        if (!this.patientId) {
            this.billingError =
                'No se encontró el paciente para cargar su facturación.';
            this._cdr.markForCheck();
            return;
        }

        this.isLoadingBilling = true;
        this.billingError = null;

        this._pacienteService.getTreatmentPlans().subscribe({
            next: (plans) => {
                this.billingPlans = plans
                    .filter((plan) => plan.patient?.id === this.patientId)
                    .sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                    );
                this.isLoadingBilling = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.billingError =
                    'No se pudo cargar la facturación del paciente.';
                this.isLoadingBilling = false;
                this._cdr.markForCheck();
            },
        });
    }

    getBillingTotal(): number {
        return this.billingPlans.reduce(
            (total, plan) => total + Number(plan.total_cost || 0),
            0
        );
    }

    getBillingPaid(): number {
        return this.billingPlans.reduce(
            (total, plan) => total + Number(plan.paid_amount || 0),
            0
        );
    }

    getBillingPending(): number {
        return this.getBillingTotal() - this.getBillingPaid();
    }

    getPlanPendingAmount(plan: TreatmentPlan): number {
        return Number(plan.total_cost || 0) - Number(plan.paid_amount || 0);
    }

    getBillingStatus(plan: TreatmentPlan): string {
        const pending = this.getPlanPendingAmount(plan);
        if (pending <= 0) {
            return 'Pagado';
        }
        if (Number(plan.paid_amount || 0) > 0) {
            return 'Parcial';
        }
        return 'Pendiente';
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
        if (!this.patient.dateOfBirth) {
            return 0;
        }

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
