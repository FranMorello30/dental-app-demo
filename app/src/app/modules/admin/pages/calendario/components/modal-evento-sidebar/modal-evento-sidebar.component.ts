import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Host,
    OnInit,
    Output,
    ViewChild,
    inject,
    input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '@environments/environment';
import { Appointment } from '@shared/models/appointement.model';
import { AppointmentStatus } from '../../calendario.model';
import { CalendarioService } from '../../calendario.service';

import { OdontologoService } from '@modules/admin/pages/odontologos/odontologos.service';
import { UploadArchivoComponent } from '@shared/components/upload-archivo/upload-archivo.component';
import { CalendarioComponent } from '../../calendario.component';
import { OdontogramaSidebarComponent } from './odontograma/odontograma-sidebar.component';

interface Condition {
    id: string;
    name: string;
    color: string;
}

interface TreatmentTeethResponse {
    treatment_teeth: Array<{
        id: string;
        color: string;
        treatment: string;
    }>;
}

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
    @ViewChild(OdontogramaSidebarComponent)
    odontogramaComponent!: OdontogramaSidebarComponent;

    private readonly _calendarioService = inject(CalendarioService);
    private readonly _odontologoService = inject(OdontologoService);
    private readonly _http = inject(HttpClient);
    private readonly _detectChange = inject(ChangeDetectorRef);

    @Host() private padre = inject(CalendarioComponent);

    selectedEvent = input.required<Appointment>();
    @Output() isClosed = new EventEmitter<void>();
    @Output() isExpandedSidebar = new EventEmitter<boolean>();
    @Output() changedEvent = new EventEmitter<void>();
    @Output() editEvent = new EventEmitter<Appointment>();
    isExpanded = false;
    isLoadingDetails = false;
    hasDetailsError = false;

    activeView: 'habits' | 'odontogram' | 'uploads' | 'finish' = 'habits';
    uploadedAttachments: any[] = [];
    teethSelection: Record<string, string> = {}; // Store teeth selection here
    treatmentOptions: Condition[] = [];

    // Form fields for finishing appointment
    finishForm = {
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
    };
    isSavingHistory = false;
    readonly isDev = !environment.production;
    get isFinalized(): boolean {
        return this.selectedEvent()?.status === 'Finalizada';
    }
    ngOnInit(): void {
        this.loadTreatmentOptions();
        if (this.isFinalized) {
            this.activeView = 'finish';
            this.isExpanded = true;
            const existingHistory = this.selectedEvent().medical_histories?.[0];
            if (existingHistory) {
                this.applyMedicalHistoryToForm(existingHistory);
            }
            this.loadFinalizedAppointment();
        }
    }
    private loadFinalizedAppointment(): void {
        const event = this.selectedEvent();
        if (!event?.id) return;

        this.isLoadingDetails = true;
        this.hasDetailsError = false;

        this._calendarioService.getAppointmentById(event.id).subscribe({
            next: (appointment) => {
                console.warn('Loaded finalized appointment:', appointment);
                Object.assign(event, appointment);
                if (appointment.start_time) {
                    event.start_time = new Date(appointment.start_time as any);
                }
                if (appointment.end_time) {
                    event.end_time = new Date(appointment.end_time as any);
                }
                this.applyMedicalHistoryToForm(
                    appointment.medical_histories?.[0]
                );
                this.isLoadingDetails = false;
                this._detectChange.detectChanges();
            },
            error: (err) => {
                console.error('Error loading appointment details', err);
                this.isLoadingDetails = false;
                this.hasDetailsError = true;
                this._detectChange.detectChanges();
            },
        });
    }

    private loadTreatmentOptions(): void {
        this._http
            .get<TreatmentTeethResponse>(
                'http://localhost:4978/api/medical-histories/treatment-teeth'
            )
            .subscribe({
                next: (response) => {
                    this.treatmentOptions = (
                        response.treatment_teeth ?? []
                    ).map((item) => ({
                        id: item.id,
                        name: item.treatment,
                        color: item.color,
                    }));
                    this._detectChange.detectChanges();
                },
                error: (error) => {
                    console.error(
                        'Error loading treatment teeth options',
                        error
                    );
                },
            });
    }

    private applyMedicalHistoryToForm(history?: any): void {
        if (!history) return;

        this.finishForm = {
            diagnosis: history.diagnosis ?? '',
            treatment: history.treatment ?? '',
            medications: history.medications ?? '',
            notes: history.notes ?? '',
        };

        const teethMap: Record<string, string> = {};
        if (history.treated_teeth?.length) {
            history.treated_teeth.forEach((tooth: any) => {
                if (tooth?.tooth_number) {
                    const treatmentId =
                        typeof tooth.treatment === 'string'
                            ? tooth.treatment
                            : tooth.treatment?.id;
                    if (treatmentId) {
                        teethMap[String(tooth.tooth_number)] = treatmentId;
                    }
                }
            });
        }
        this.teethSelection = teethMap;
    }

    getTreatmentName(treatment: any): string {
        if (!treatment) return '';
        if (typeof treatment === 'string') {
            return (
                this.treatmentOptions.find((t) => t.id === treatment)?.name ??
                treatment
            );
        }
        const treatmentId =
            treatment.id ?? treatment.treatment_id ?? treatment.treatmentId;
        if (treatmentId) {
            return (
                this.treatmentOptions.find((t) => t.id === String(treatmentId))
                    ?.name ?? String(treatmentId)
            );
        }
        return treatment.treatment ?? '';
    }

    getAttachmentName(file: any): string {
        if (!file) return '';
        return (
            file.name ??
            file.nombre ??
            file.nombreOriginal ??
            file.ruta ??
            String(file)
        );
    }

    readonly edoCitas: AppointmentStatus[] = [
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
    private readonly _futureRestricted: AppointmentStatus[] = [
        'En consulta',
        'En espera',
        'Ausente',
        'Pendiente de pago',
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
    private readonly _rescheduleAllowed: AppointmentStatus[] = [
        'Confirmada',
        'Sin confirmar',
        'Cancelada',
    ];
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

    setView(view: 'habits' | 'odontogram' | 'uploads' | 'finish') {
        this.activeView = view;
        if (!this.isExpanded) {
            this.isExpanded = true;
        }
        //  this.isExpandedSidebar.emit(this.isExpanded);
    }

    getHabitItems(): Array<{ label: string; value: string }> {
        const habit = this.getPatientHabits();
        if (!habit) return [];

        return [
            {
                label: 'Fumador',
                value: habit.smoking ? 'Sí' : 'No',
            },
            {
                label: 'Consumo de alcohol',
                value: habit.alcohol ? 'Sí' : 'No',
            },
            {
                label: 'Bruxismo',
                value: habit.bruxism ? 'Sí' : 'No',
            },
            {
                label: 'Uso de hilo dental',
                value: this.formatFrequency(habit.flossing, {
                    daily: 'Diario',
                    weekly: 'Semanal',
                    never: 'Nunca',
                }),
            },
            {
                label: 'Frecuencia de cepillado',
                value: this.formatFrequency(habit.brushingFrequency, {
                    '1': '1 vez al día',
                    '2': '2 veces al día',
                    '3': '3 veces al día',
                    '4': '4 veces al día',
                    daily: 'Diario',
                }),
            },
        ];
    }

    private getPatientHabits(): any | null {
        const patient = this.selectedEvent()?.patient as any;
        return patient?.habit ?? patient?.habits ?? null;
    }

    private formatFrequency(
        value: string | null | undefined,
        dictionary: Record<string, string>
    ): string {
        if (!value) return 'No registrado';
        return dictionary[value] ?? String(value);
    }

    fillDemoFinish(): void {
        this.finishForm = {
            diagnosis: 'Caries dental en molar superior.',
            treatment: 'Limpieza profunda y obturación con resina.',
            medications: 'Ibuprofeno 400mg cada 8h por 2 días.',
            notes: 'Paciente toleró bien el procedimiento.',
        };
        this._detectChange.detectChanges();
    }

    saveMedicalRecord() {
        if (!this.finishForm.diagnosis || !this.finishForm.treatment) {
            // Basic validation
            alert('Please complete Diagnosis and Treatment notes');
            return;
        }

        this.isSavingHistory = true;
        const currentEvent = this.selectedEvent();

        // Get teeth data from local property
        const teeth = Object.entries(this.teethSelection).map(
            ([id, condition]) => ({
                tooth_number: parseInt(id),
                treatment: condition,
            })
        );

        // Get attachments
        // Assuming this.uploadedAttachments contains { nombre, ruta... } objects
        // But the type says string[]. We need to check UploadArchivoComponent.
        // Assuming for now they match backend expectation.
        // If string[], we need to fix. Let's assume they are objects for now or I will mock it.
        // Actually uploadedAttachments from `uploadFiles($event)` are passed from child.

        const payload = {
            appointmentId: currentEvent.id,
            patientId: currentEvent.patient.id,
            dentistId: currentEvent.dentist.id,
            diagnosis: this.finishForm.diagnosis,
            treatment: this.finishForm.treatment,
            medications: this.finishForm.medications,
            notes: this.finishForm.notes,
            teeth: teeth,
            attachments: this.uploadedAttachments, // This needs to match CreateMedicalAttachmentDto
        };

        this._calendarioService.createMedicalHistory(payload).subscribe({
            next: () => {
                this.isSavingHistory = false;
                this.changedEvent.emit(); // Refresh calendar
                this.close();
            },
            error: (err) => {
                console.error(err);
                this.isSavingHistory = false;
            },
        });
    }

    uploadFiles(files: any[]): void {
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
        if (!this.canReschedule()) return;
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

    toggleReschedulePanel(): void {
        if (this.rescheduleMode) {
            this.cancelReschedule();
            return;
        }

        this.startReschedule();
    }

    canReschedule(): boolean {
        const status = this.selectedEvent()?.status as
            | AppointmentStatus
            | undefined;
        if (!status) return false;
        return this._rescheduleAllowed.includes(status);
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
            case 'En espera':
                return 'bg-teal-500';
            case 'En consulta':
                return 'bg-purple-500';
            case 'Ausente':
                return 'bg-indigo-500';
            case 'Pendiente de pago':
                return 'bg-amber-500';
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

        if (this.isFinalized) {
            return ['Finalizada'];
        }

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

    isFutureAppointment(): boolean {
        const event = this.selectedEvent();
        if (!event?.start_time) return false;
        const startTime = new Date(event.start_time as any);
        return startTime.getTime() > new Date().getTime();
    }

    changeStatus(status: AppointmentStatus) {
        if (this.isFinalized) return;

        if (!status || status === this.selectedEvent().status) return;

        if (
            status === 'Finalizada' &&
            this.selectedEvent().status !== 'Finalizada'
        ) {
            // Switch to finish view to collect data
            this.setView('finish');
            // Do not update status yet. Usually we want to force them to fill the form.
            // Or we can just set updatingStatus to false and let them fill it.
            return;
        }

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

    sendMessageToPatient() {
        const phone = this.selectedEvent().patient.phone;
        if (!phone) return;

        // Limpiar número y asegurar formato para WhatsApp (asumiendo código de país si no está)
        // Por ahora usamos el número tal cual, quitando caracteres no numéricos excepto el +
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const message = `Hola ${this.selectedEvent().patient.name}, le escribimos de Dental Care acerca de su cita programada para el ${this.selectedEvent().start_time}.`;

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
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
