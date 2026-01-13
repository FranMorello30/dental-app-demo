import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    inject,
    input,
    output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Appointment } from '@shared/models/appointement.model';
import { Dentist } from '@shared/models/dentist.model';
import { Paciente } from '@shared/models/pacientes.model';
import { Treatment } from '@shared/models/treatment.model';
import { DefinicionesService } from '@shared/services/definiciones.service';
import { AppointmentStatus } from '../../calendario.model';
import { CalendarioService } from '../../calendario.service';

@Component({
    selector: 'sidebar-registro',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatOptionModule,
    ],
    templateUrl: './sidebar-registro.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarRegistroComponent implements OnInit, OnChanges, OnDestroy {
    private readonly _fb = inject(FormBuilder);
    private readonly _calendarioService = inject(CalendarioService);
    private readonly _definicionService = inject(DefinicionesService);
    private readonly _cdr = inject(ChangeDetectorRef);

    public selectedDate = input.required<Date>();
    public dentist = input.required<Dentist>();

    public isClosed = output<void>();
    public appointmentCreated = output<void>();

    public formulario!: FormGroup<{
        estado: FormControl<string>;
        tratamiento: FormControl<string>;
        startTime: FormControl<string>;
        endTime: FormControl<string>;
        paciente: FormControl<string | Paciente>;
        dentist: FormControl<Dentist>;
    }>;

    public tratamientos: Treatment[] = [];
    public edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];

    public patients: Paciente[] = [];
    public pacienteSeleccionado: Paciente | null = null;
    public searchControl = new FormControl('');
    public searchResults: Paciente[] = [];
    public showResults = false;

    public timeInitSlots: string[] = [];
    public timeEndSlots: string[] = [];
    public filteredEndSlots: string[] = [];

    public currentErrors: string | string[] | null = null;

    ngOnInit(): void {
        document.body.style.overflow = 'hidden';
        this._createForm();
        this._loadTreatments();
        this._loadPatients();
        this._listenSearch();
        this._listenStartTime();
        this._initSlots();
    }

    ngOnDestroy(): void {
        this._restoreBodyScroll();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes['selectedDate'] && !changes['selectedDate'].firstChange) ||
            (changes['dentist'] && !changes['dentist'].firstChange)
        ) {
            this._initSlots();
        }
    }

    close(): void {
        this._resetState();
        this._restoreBodyScroll();
        this.isClosed.emit();
    }

    createAppointment(): void {
        if (!this.formulario || this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        const startDateTime = this._combineDateAndTime(
            this.selectedDate(),
            this.formulario.value.startTime
        );
        const endDateTime = this._combineDateAndTime(
            this.selectedDate(),
            this.formulario.value.endTime
        );

        const pacienteValue = this.formulario.value.paciente;
        const pacienteId =
            typeof pacienteValue === 'string'
                ? pacienteValue
                : (pacienteValue as Paciente).id;
        const pacienteName =
            typeof pacienteValue === 'string'
                ? pacienteValue
                : (pacienteValue as Paciente).name;

        const payload: Partial<Appointment> = {
            title: `Cita con ${pacienteName}`,
            description: this.formulario.value.tratamiento,
            start_time: startDateTime as any,
            end_time: endDateTime as any,
            status: this.formulario.value.estado,
            treatment: this.formulario.value.tratamiento,
            dentistId: this.dentist().id,
            patientId: pacienteId as string,
        } as any;

        this._calendarioService.createAppointment(payload).subscribe({
            next: () => {
                this.appointmentCreated.emit();
                this.close();
            },
            error: (error) => {
                this.currentErrors =
                    error?.error?.message || 'Error al crear la cita';
                this._cdr.detectChanges();
            },
        });
    }

    selectPaciente(paciente: Paciente): void {
        this.pacienteSeleccionado = paciente;
        this.formulario.get('paciente')?.setValue(paciente);
        this.showResults = false;
        this.searchControl.setValue('');
    }

    clearPaciente(): void {
        this.pacienteSeleccionado = null;
        this.formulario.get('paciente')?.setValue('');
        this.searchControl.setValue('');
    }

    private _createForm(): void {
        this.formulario = this._fb.group({
            estado: this._fb.control('Confirmada', Validators.required),
            tratamiento: this._fb.control('', Validators.required),
            startTime: this._fb.control('', Validators.required),
            endTime: this._fb.control(
                { value: '', disabled: true },
                Validators.required
            ),
            paciente: this._fb.control<string | Paciente>(
                '',
                Validators.required
            ),
            dentist: this._fb.control(this.dentist()),
        });
    }

    private _listenSearch(): void {
        this.searchControl.valueChanges.subscribe((value) => {
            if (value && value.length > 0) {
                this.searchResults = this._filterPacientes(value);
                this.showResults = true;
            } else {
                this.searchResults = [];
                this.showResults = false;
            }
            this._cdr.markForCheck();
        });
    }

    private _listenStartTime(): void {
        this.formulario
            .get('startTime')
            ?.valueChanges.subscribe((selected: string) => {
                if (selected && selected.trim() !== '') {
                    const calculatedEnd = this._calculateEndTime(selected);
                    this.formulario.get('endTime')?.enable();
                    this.formulario.get('endTime')?.setValue(calculatedEnd);
                    this.filteredEndSlots = this.timeEndSlots.filter(
                        (time) =>
                            this._timeToMinutes(time) >=
                            this._timeToMinutes(calculatedEnd)
                    );
                } else {
                    this.formulario.get('endTime')?.disable();
                    this.formulario.get('endTime')?.setValue('');
                    this.filteredEndSlots = [];
                }
                this._cdr.markForCheck();
            });
    }

    private _initSlots(): void {
        if (!this.selectedDate() || !this.dentist()) {
            return;
        }

        this._calendarioService
            .getAppointments()
            .subscribe((appointments: Appointment[]) => {
                appointments.forEach((app) => {
                    app.start_time = new Date(app.start_time);
                    app.end_time = new Date(app.end_time);
                });

                const dateStr = this.selectedDate().toISOString().split('T')[0];
                const todays = appointments.filter(
                    (app) =>
                        app.dentist.id === this.dentist().id &&
                        app.start_time.toISOString().startsWith(dateStr)
                );

                const bookedRanges = todays.map((app) => ({
                    start:
                        app.start_time.getHours() * 60 +
                        app.start_time.getMinutes(),
                    end:
                        app.end_time.getHours() * 60 +
                        app.end_time.getMinutes(),
                }));

                const rawSlots =
                    this._definicionService.getAvailableTimesForDay(
                        this.selectedDate(),
                        this.dentist()
                    ) || [];

                if (!rawSlots.length) {
                    this.timeInitSlots = [];
                    this.timeEndSlots = [];
                    this.filteredEndSlots = [];
                    this.currentErrors =
                        'No hay horarios disponibles para este día';
                    this.formulario.get('endTime')?.disable();
                    this._cdr.markForCheck();
                    return;
                }

                const availableRawSlots = rawSlots.filter((slot) => {
                    const [h, m] = slot.split(':').map(Number);
                    const mins = h * 60 + m;
                    return !bookedRanges.some(
                        (range) => mins >= range.start && mins < range.end
                    );
                });

                if (!availableRawSlots.length) {
                    this.timeInitSlots = [];
                    this.timeEndSlots = [];
                    this.filteredEndSlots = [];
                    this.currentErrors =
                        'No hay horarios disponibles para este día';
                    this.formulario.get('endTime')?.disable();
                    this._cdr.markForCheck();
                    return;
                }

                this.timeInitSlots = availableRawSlots.map((t) =>
                    this._formatTo12Hour(t)
                );
                this.timeEndSlots = this.timeInitSlots.map((s) =>
                    this._calculateEndTime(s)
                );

                const preferredSlot24 = availableRawSlots.find(
                    (slot) => slot === this._formatDateTo24(this.selectedDate())
                );

                const defaultStart = preferredSlot24
                    ? this._formatTo12Hour(preferredSlot24)
                    : this.timeInitSlots[0] || '';

                this.formulario.get('startTime')?.setValue(defaultStart);
                this.formulario.get('endTime')?.enable();
                const defaultEnd = defaultStart
                    ? this._calculateEndTime(defaultStart)
                    : '';
                this.formulario.get('endTime')?.setValue(defaultEnd);
                this.filteredEndSlots = this.timeEndSlots.filter(
                    (t) =>
                        this._timeToMinutes(t) >=
                        this._timeToMinutes(defaultEnd)
                );

                this.currentErrors = null;
                this._cdr.markForCheck();
            });
    }

    private _loadTreatments(): void {
        this._calendarioService.getAllTreatments().subscribe({
            next: (response) => {
                this.tratamientos = response;
                this._cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching Treatments:', error);
            },
        });
    }

    private _loadPatients(): void {
        this._calendarioService.getAllPatients().subscribe({
            next: (response) => {
                this.patients = response;
                this._cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching Pacientes:', error);
            },
        });
    }

    private _filterPacientes(value: string): Paciente[] {
        const filterValue = value.toLowerCase();
        return this.patients.filter((option) =>
            option.name.toLowerCase().includes(filterValue)
        );
    }

    private _combineDateAndTime(date: Date, time12: string): string {
        const yyyyMMdd = date.toISOString().split('T')[0];
        const [timePart, period] = time12.split(' ');
        let [hour, minute] = timePart.split(':').map(Number);
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const hhmmss = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}:00`;
        return `${yyyyMMdd} ${hhmmss}`;
    }

    private _formatTo12Hour(time24: string): string {
        const [hourStr, minuteStr] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        if (hour === 0) {
            hour = 12;
        }
        return `${hour.toString().padStart(2, '0')}:${minuteStr} ${period}`;
    }

    private _formatDateTo24(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private _parse12HourTime(time12: string): number {
        const [timePart, period] = time12.split(' ');
        const [hourStr, minuteStr] = timePart.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (period === 'PM' && hour < 12) {
            hour += 12;
        }
        if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        return hour * 60 + minute;
    }

    private _calculateEndTime(startTime: string): string {
        if (!startTime) return '';
        const totalMinutes = this._parse12HourTime(startTime) + 30;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        const time24 = `${endHours.toString().padStart(2, '0')}:${endMinutes
            .toString()
            .padStart(2, '0')}`;
        return this._formatTo12Hour(time24);
    }

    private _timeToMinutes(time: string): number {
        return this._parse12HourTime(time);
    }

    private _resetState(): void {
        this.currentErrors = null;
        this.formulario.reset({
            estado: 'Confirmada',
            tratamiento: '',
            startTime: '',
            endTime: '',
            paciente: '',
            dentist: this.dentist(),
        });
        this.formulario.get('endTime')?.disable();
        this.pacienteSeleccionado = null;
        this.searchControl.reset();
        this.searchResults = [];
        this.showResults = false;
    }

    private _restoreBodyScroll(): void {
        document.body.style.overflow = '';
    }
}
