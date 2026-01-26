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
import { DefinicionesService } from '@shared/services/definiciones.service';
import { NgxMaskDirective } from 'ngx-mask';
import { forkJoin, of, switchMap } from 'rxjs';
import { PacienteService } from '../../../pacientes/pacientes.service';
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
        NgxMaskDirective,
    ],
    templateUrl: './sidebar-registro.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarRegistroComponent implements OnInit, OnChanges, OnDestroy {
    private readonly _fb = inject(FormBuilder);
    private readonly _calendarioService = inject(CalendarioService);
    private readonly _definicionService = inject(DefinicionesService);
    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _pacienteService = inject(PacienteService);

    public selectedDate = input.required<Date>();
    public dentist = input.required<Dentist>();

    public isClosed = output<void>();
    public appointmentCreated = output<void>();
    public onRegisterPatient = output<void>();

    public formulario!: FormGroup<{
        estado: FormControl<string>;
        tratamiento: FormControl<string>;
        startTime: FormControl<string>;
        endTime: FormControl<string>;
        paciente: FormControl<string | Paciente>;
        dentist: FormControl<Dentist>;
    }>;

    public patientForm!: FormGroup;

    // Stepper & Sidebar Logic
    showExtraSidebar = false;
    currentStep = 1;
    steps = [
        {
            number: 1,
            title: 'Datos Personales',
            icon: 'heroicons_outline:user',
        },
        { number: 2, title: 'Hábitos', icon: 'heroicons_outline:heart' },
        {
            number: 3,
            title: 'Historial',
            icon: 'heroicons_outline:clipboard-document-list',
        },
        { number: 4, title: 'Adjuntos', icon: 'heroicons_outline:paper-clip' },
    ];
    public uploadedFiles: File[] = [];

    isExpanded = false;
    public tratamientos: string[] = [];
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
    isSaving = false;
    activeView: 'form' | 'search' | 'new-patient' = 'form';
    public patients: Paciente[] = [];
    public pacienteSeleccionado: Paciente | null = null;
    public searchControl = new FormControl('');
    public searchResults: Paciente[] = [];
    public showResults = false;
    public showPatientsList = false;

    public timeInitSlots: string[] = [];
    public timeEndSlots: string[] = [];
    public filteredEndSlots: string[] = [];

    public currentErrors: string | string[] | null = null;
    public readonly isDev = true;

    ngOnInit(): void {
        document.body.style.overflow = 'hidden';
        this._createForm();
        this._createPatientForm();
        this._loadDentistServices();
        this._loadPatients();
        this._listenSearch();
        this._listenStartTime();
        this._initSlots();
    }
    toggleExpand() {
        //console.log('Toggling sidebar expansion');
        this.isExpanded = !this.isExpanded;
        // this.isExpandedSidebar.emit(this.isExpanded);
    }
    setView(view: 'search' | 'form' | 'new-patient') {
        this.activeView = view;
        if (!this.isExpanded) {
            this.isExpanded = true;
        }
        //  this.isExpandedSidebar.emit(this.isExpanded);
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
        if (changes['dentist'] && changes['dentist'].currentValue) {
            this._loadDentistServices();
        }
    }

    close(): void {
        this._resetState();
        this._restoreBodyScroll();
        this.isClosed.emit();
    }

    // Navigation methods
    nextStep(): void {
        if (this.currentStep < this.steps.length) {
            this.currentStep++;
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    registerNewPatient(): void {
        this.showExtraSidebar = true;
        this.currentStep = 1;
        this.isExpanded = true; // Ensure main sidebar is wide enough or just overlays
    }

    cancelNewPatient(): void {
        this.showExtraSidebar = false;
        this.patientForm.reset();
        this.currentStep = 1;
        this.uploadedFiles = [];
    }

    onFileSelected(event: any): void {
        const files: FileList = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                this.uploadedFiles.push(files[i]);
            }
        }
    }

    removeFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
    }

    fillDemoPatient(): void {
        const now = new Date();
        const birthDate = new Date(
            now.getFullYear() - 28,
            Math.max(0, now.getMonth() - 3),
            12
        );
        const yyyy = birthDate.getFullYear();
        const mm = `${birthDate.getMonth() + 1}`.padStart(2, '0');
        const dd = `${birthDate.getDate()}`.padStart(2, '0');

        this.patientForm.patchValue({
            dni: '12.345.678',
            name: 'Paciente Demo',
            phone: '412 5551234',
            date_of_birth: `${yyyy}-${mm}-${dd}`,
            email: 'demo@correo.com',
            insurance: 'Seguro Demo',
            insurance_id: 'P-12345',
            address: 'Av. Principal, Caracas',
            notes: 'Datos de prueba para desarrollo.',
            habits: {
                smoking: false,
                alcohol: false,
                bruxism: true,
                brushingFrequency: '2',
                flossing: 'weekly',
            },
            history: {
                allergies: 'Ninguna',
                medications: 'Ninguno',
                surgeries: 'Sin cirugías',
                illnesses: 'Sin antecedentes',
            },
        });

        this.patientForm.markAsDirty();
        this.patientForm.markAsTouched();
        this._cdr.markForCheck();
    }

    savePatient(): void {
        if (this.patientForm.invalid) {
            this.patientForm.markAllAsTouched();
            // If invalid in step 1, go back
            if (
                this.patientForm.get('dni')?.invalid ||
                this.patientForm.get('name')?.invalid
            ) {
                this.currentStep = 1;
            }
            return;
        }

        this.isSaving = true;
        this._cdr.markForCheck();

        const formValue = this.patientForm.getRawValue();

        // 1. Prepare base data
        const patientData: any = {
            ...formValue,
        };
        // history and habits are already correctly structured in formValue for the updated backend DTO

        // 2. Handle File Uploads (if any)
        let uploadObservables = [];
        if (this.uploadedFiles.length > 0) {
            uploadObservables = this.uploadedFiles.map((file) =>
                this._pacienteService.uploadFile(file)
            );
        }

        // 3. Execute uploads then create patient
        const action$ =
            uploadObservables.length > 0 ? forkJoin(uploadObservables) : of([]);

        action$
            .pipe(
                switchMap((uploadResults: any[]) => {
                    // Map upload results to DTO structure
                    // Backend returns { nombre, nombreOriginal, size, ruta }
                    // DTO expects same or similar? Check CreateAttachmentDto
                    if (uploadResults.length > 0) {
                        patientData.attachments = uploadResults;
                    }

                    return this._pacienteService.createPatient(patientData);
                })
            )
            .subscribe({
                next: (response: any) => {
                    this.isSaving = false;
                    const pacienteCreado = response.data || response;

                    this._loadPatients();
                    this.selectPaciente(pacienteCreado);
                    this.cancelNewPatient();
                    this.setView('form');
                    this.onRegisterPatient.emit();
                    this._cdr.markForCheck();
                },
                error: (error) => {
                    this.isSaving = false;
                    this.currentErrors =
                        error?.error?.message || 'Error al crear el paciente';
                    this._cdr.markForCheck();
                },
            });
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
        this.showPatientsList = false;

        if (this.showExtraSidebar) {
            this.cancelNewPatient();
        }

        this.toggleExpand();
    }

    clearPaciente(): void {
        this.pacienteSeleccionado = null;
        this.formulario.get('paciente')?.setValue('');
        this.searchControl.setValue('');
    }

    togglePatientsList(): void {
        this.showPatientsList = !this.showPatientsList;
        this.showResults = false;
        this._cdr.markForCheck();
    }

    hidePatientsList(): void {
        this.showPatientsList = false;
        this._cdr.markForCheck();
    }

    private _createPatientForm(): void {
        this.patientForm = this._fb.group({
            // Step 1: Registro
            address: [''],
            dni: ['', [Validators.required, Validators.minLength(7)]],
            balance: [0],
            date_of_birth: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            insurance: [''],
            insurance_id: [''],
            name: ['', [Validators.required, Validators.minLength(3)]],
            notes: [''],
            phone: ['', [Validators.required, Validators.minLength(10)]],

            // Step 2: Habitos (Mock fields)
            habits: this._fb.group({
                smoking: [false],
                alcohol: [false],
                bruxism: [false],
                flossing: ['never'], // daily, weekly, never
                brushingFrequency: ['2'],
            }),

            // Step 3: Historial (Mock fields)
            history: this._fb.group({
                allergies: [''],
                medications: [''],
                surgeries: [''],
                illnesses: [''],
            }),
        });
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

    private _loadDentistServices(): void {
        const specialties = this.dentist()?.specialty ?? '';
        this.tratamientos = specialties
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item);
        this._cdr.markForCheck();
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
        this.showPatientsList = false;
        this.timeInitSlots = [];
        this.timeEndSlots = [];
        this.filteredEndSlots = [];
    }

    private _restoreBodyScroll(): void {
        document.body.style.overflow = '';
    }
}
