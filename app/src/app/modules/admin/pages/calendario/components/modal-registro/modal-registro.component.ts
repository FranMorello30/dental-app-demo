import { AsyncPipe, CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Host,
    OnChanges,
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
import { MatOptionModule } from '@angular/material/core';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Appointment } from '@shared/models/appointement.model';
import { Dentist } from '@shared/models/dentist.model';
import { Paciente } from '@shared/models/pacientes.model';
import { Treatment } from '@shared/models/treatment.model';
import { DefinicionesService } from '@shared/services/definiciones.service';
import { Observable } from 'rxjs';
import { CalendarioComponent } from '../../calendario.component';
import { AppointmentStatus } from '../../calendario.model';
import { CalendarioService } from '../../calendario.service';

@Component({
    selector: 'modal-registro',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatOptionModule,
        AsyncPipe,
    ],
    templateUrl: './modal-registro.component.html',
    styles: [
        `
            ::ng-deep .mat-mdc-form-field-subscript-wrapper {
                display: none;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { subscriptSizing: 'dynamic', appearance: 'outline' },
        },
    ],
})
export class ModalRegistroComponent implements OnInit, OnChanges {
    @Host() private padre = inject(CalendarioComponent);

    private readonly _formBuilder = inject(FormBuilder);
    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _calendarioService = inject(CalendarioService);
    private readonly _definicionService = inject(DefinicionesService);

    public selectedDate = input.required<Date>();
    public dentist = input.required<Dentist>();

    public isClosed = output<boolean>();
    errors;

    timeInitSlots = [];
    timeEndSlots = [];
    // Propiedad para almacenar los endSlots filtrados
    public filteredEndSlots = [];

    public tratamientos: Treatment[] = [];

    public edoCitas: AppointmentStatus[] = [
        'Sin confirmar',
        'Confirmada',
        'En consulta',
        'Cancelada',
        'Finalizada',
        'Finalizada (Pendiente)',
    ];
    patients: Paciente[] = [];
    paciente: Paciente = null;
    filteredOptions: Observable<Paciente[]>;

    public formulario: FormGroup<{
        estado: FormControl<string>;
        tratamiento: FormControl<string>;
        startTime: FormControl<string>;
        endTime: FormControl<string>;
        paciente: FormControl<string | Paciente>;
        dentist: FormControl<Dentist>;
    }>;

    searchControl = new FormControl('');
    searchResults: Paciente[] = [];
    showResults = false;

    ngOnInit(): void {
        this._getTreatments();
        this._getPacientes();
        // Crea el formulario
        this._createForm();
        if (this.selectedDate()) {
            this.initializeSlots();
            // Cuando se cambia el startTime, se actualiza el endTime y se filtran los endSlots
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
                    this._detectChange.markForCheck();
                });

            this.formulario.get('dentist')?.setValue(this.dentist());
        }

        // Listen to search changes
        this.searchControl.valueChanges.subscribe((value) => {
            if (value && value.length > 0) {
                this.searchResults = this._filter(value);
                this.showResults = true;
            } else {
                this.searchResults = [];
                this.showResults = false;
            }
            this._detectChange.markForCheck();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedDate && changes.selectedDate.currentValue) {
            this.initializeSlots();
        }
    }
    cerrarFormCita() {
        // Limpia slots y formulario
        this.timeInitSlots = [];
        this.timeEndSlots = [];
        this.filteredEndSlots = [];
        this.formulario.reset();
        this.searchControl.reset();
        this.searchResults = [];
        this.showResults = false;
        this.paciente = null;
        this.isClosed.emit(true);
    }
    private _combineDateAndTime(date: Date, time12: string): string {
        // Convierte el string de fecha a YYYY-MM-DD
        const yyyyMMdd = date.toISOString().split('T')[0];
        // Parsea el tiempo en formato 12 horas a 24 horas
        const [timePart, period] = time12.split(' ');
        let [hour, minute] = timePart.split(':').map(Number);
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        // Formatea a HH:mm:ss
        const hhmmss = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}:00`;
        return `${yyyyMMdd} ${hhmmss}`;
    }

    grabarCita() {
        if (this.formulario.invalid) {
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

        const cita = {
            title: 'Cita con ' + pacienteName,
            description: this.formulario.value.tratamiento,
            start_time: startDateTime,
            end_time: endDateTime,
            status: this.formulario.value.estado,
            treatment: this.formulario.value.tratamiento,
            dentistId: this.dentist().id,
            patientId: pacienteId,
        };

        this._calendarioService.createAppointment(cita).subscribe({
            next: (response) => {
                console.log('Cita creada exitosamente:', response);
                this.cerrarFormCita();
                this.padre.getAppointments(); // Actualiza la lista de citas en el calendario
            },
            error: (error) => {
                console.error('Error al crear la cita:', error);
                this.errors = error.error.message;
            },
        });
    }
    private initializeSlots() {
        if (!this.selectedDate() || !this.formulario) return;

        this._calendarioService
            .getAppointments()
            .subscribe((appointments: Appointment[]) => {
                // convierte fechas
                appointments.forEach((app) => {
                    app.start_time = new Date(app.start_time);
                    app.end_time = new Date(app.end_time);
                });

                // filtra por dentista y fecha
                const dateStr = this.selectedDate().toISOString().split('T')[0];
                const todays = appointments.filter(
                    (app) =>
                        app.dentist.id === this.dentist().id &&
                        app.start_time.toISOString().startsWith(dateStr)
                );

                // construye rangos en minutos
                const bookedRanges = todays.map((app) => ({
                    start:
                        app.start_time.getHours() * 60 +
                        app.start_time.getMinutes(),
                    end:
                        app.end_time.getHours() * 60 +
                        app.end_time.getMinutes(),
                }));

                // toma los slots raw y elimina los que caen dentro de cualquier rango [start, end)
                const rawSlots =
                    this._definicionService.getAvailableTimesForDay(
                        this.selectedDate(),
                        this.dentist()
                    );
                const availableRawSlots = rawSlots.filter((slot) => {
                    const [h, m] = slot.split(':').map(Number);
                    const mins = h * 60 + m;
                    return !bookedRanges.some(
                        (range) => mins >= range.start && mins < range.end
                    );
                });

                // formatea y calcula endSlots
                this.timeInitSlots = availableRawSlots.map((t) =>
                    this._formatTo12Hour(t)
                );
                this.timeEndSlots = this.timeInitSlots.map((s) =>
                    this._calculateEndTime(s)
                );

                // valores por defecto y filtrado de endSlots
                const defaultStart = this.timeInitSlots[0] || '';
                this.formulario.get('startTime')?.setValue(defaultStart);
                const defaultEnd = defaultStart
                    ? this._calculateEndTime(defaultStart)
                    : '';
                this.formulario.get('endTime')?.setValue(defaultEnd);
                this.filteredEndSlots = this.timeEndSlots.filter(
                    (t) =>
                        this._timeToMinutes(t) >=
                        this._timeToMinutes(defaultEnd)
                );

                this._detectChange.markForCheck();
            });
    }

    private _filter(value: string): Paciente[] {
        const filterValue = value.toLowerCase();

        return this.patients.filter((option) =>
            option.name.toLowerCase().includes(filterValue)
        );
    }

    // Actualiza el cálculo de fin usando el formato de 12 horas
    private _calculateEndTime(startTime: string): string {
        if (!startTime) return '';
        const totalMinutes = this._parse12HourTime(startTime) + 30; // Agrega 30 minutos
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        const time24 = `${endHours.toString().padStart(2, '0')}:${endMinutes
            .toString()
            .padStart(2, '0')}`;
        return this._formatTo12Hour(time24);
    }

    // Actualiza la función para convertir un tiempo 12 horas en minutos
    private _timeToMinutes(time: string): number {
        return this._parse12HourTime(time);
    }

    private _createForm() {
        this.formulario = this._formBuilder.group({
            estado: ['Confirmada', Validators.required],
            tratamiento: ['', Validators.required],
            startTime: ['', Validators.required],
            endTime: [{ value: '', disabled: true }, Validators.required],
            paciente: new FormControl<string | Paciente>(
                '',
                Validators.required
            ),
            dentist: [this.dentist()],
        });
    }

    private _getPacientes() {
        this._calendarioService.getAllPatients().subscribe({
            next: (response) => {
                this.patients = response;
                this._detectChange.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching Pacientes:', error);
            },
        });
    }

    private _getTreatments() {
        this._calendarioService.getAllTreatments().subscribe({
            next: (response) => {
                this.tratamientos = response;
                this._detectChange.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching Treatments:', error);
            },
        });
    }

    // Convierte una hora en formato 24 horas (HH:mm) a 12 horas (hh:mm AM/PM)
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

    // Parsea un tiempo en formato 12 horas (hh:mm AM/PM) y lo convierte a minutos
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

    selectPaciente(paciente: Paciente) {
        this.paciente = paciente;
        this.formulario.get('paciente').setValue(paciente);
        this.showResults = false;
        this.searchControl.setValue('');
    }

    clearSelection() {
        this.paciente = null;
        this.formulario.get('paciente').setValue('');
        this.searchControl.setValue('');
    }
}
