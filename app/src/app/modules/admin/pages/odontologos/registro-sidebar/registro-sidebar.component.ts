import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Output,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Dentist } from '@shared/models/dentist.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    CreateDentistPayload,
    CreateSchedulePayload,
    CreateUnavailabilityPayload,
    OdontologoService,
    Specialty,
} from '../odontologos.service';

interface LocalSchedule extends Omit<CreateSchedulePayload, 'dentistId'> {}

interface LocalUnavailability
    extends Omit<
        CreateUnavailabilityPayload,
        'dentistId' | 'unavailable_date'
    > {
    start_date: string;
    end_date: string;
    repeatYearly?: boolean;
}

interface WeekDaySchedule {
    day_of_week: number;
    label: string;
    is_working_day: boolean;
    start_time: string;
    end_time: string;
}

@Component({
    selector: 'app-odontologo-registro-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatSlideToggleModule,
    ],
    templateUrl: './registro-sidebar.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroSidebarComponent {
    private readonly odontologoService = inject(OdontologoService);
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly defaultStart = '08:00';
    private readonly defaultEnd = '17:00';

    @Output() closed = new EventEmitter<void>();
    @Output() created = new EventEmitter<Dentist>();

    saving = false;
    schedules: LocalSchedule[] = [];
    unavailabilities: LocalUnavailability[] = [];
    specialties: Specialty[] = [];
    selectedSpecialtyIds = new Set<string>();

    weekSchedule: WeekDaySchedule[] = [
        {
            day_of_week: 1,
            label: 'Lunes',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 2,
            label: 'Martes',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 3,
            label: 'Miércoles',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 4,
            label: 'Jueves',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 5,
            label: 'Viernes',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 6,
            label: 'Sábado',
            is_working_day: true,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
        {
            day_of_week: 0,
            label: 'Domingo',
            is_working_day: false,
            start_time: this.defaultStart,
            end_time: this.defaultEnd,
        },
    ];

    steps = [
        { number: 1, title: 'Info' },
        { number: 2, title: 'Servicios' },
        { number: 3, title: 'Horario' },
        { number: 4, title: 'Días libres' },
    ];
    currentStep = 1;

    readonly weekDays = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
    ];

    getDayLabel(day: number): string {
        return this.weekDays.find((d) => d.value === day)?.label ?? '';
    }

    nextStep(): void {
        if (!this.isCurrentStepValid()) {
            this.markCurrentStepTouched();
            this.cdr.markForCheck();
            return;
        }
        if (this.currentStep < this.steps.length) {
            this.currentStep++;
            this.cdr.markForCheck();
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.cdr.markForCheck();
        }
    }

    infoForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        specialty: ['', Validators.required],
        nro_Id: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        license_number: ['', Validators.required],
        avatar: [''],
        notes: [''],
        isActive: [true],
    });

    daysOffForm: FormGroup = this.fb.group({
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
        reason: [''],
        repeatYearly: [false],
    });

    showDayOffModal = false;

    constructor() {
        this.loadSpecialties();
    }

    private loadSpecialties(): void {
        this.odontologoService.getSpecialties().subscribe({
            next: (data) => {
                this.specialties = data;
                this.cdr.markForCheck();
            },
            error: () => {
                this.specialties = [];
                this.cdr.markForCheck();
            },
        });
    }

    toggleSpecialty(id: string): void {
        if (this.selectedSpecialtyIds.has(id)) {
            this.selectedSpecialtyIds.delete(id);
        } else {
            this.selectedSpecialtyIds.add(id);
        }
        this.cdr.markForCheck();
    }

    isSpecialtySelected(id: string): boolean {
        return this.selectedSpecialtyIds.has(id);
    }

    toggleWorkingDay(day: WeekDaySchedule): void {
        day.is_working_day = !day.is_working_day;
        if (day.is_working_day) {
            day.start_time = day.start_time || this.defaultStart;
            day.end_time = day.end_time || this.defaultEnd;
        }
        this.cdr.detectChanges();
    }

    openDayOffModal(): void {
        this.showDayOffModal = true;
        this.cdr.markForCheck();
    }

    closeDayOffModal(): void {
        this.showDayOffModal = false;
        this.daysOffForm.reset({ repeatYearly: false });
        this.cdr.markForCheck();
    }

    submitDayOff(): void {
        if (this.daysOffForm.invalid) {
            this.daysOffForm.markAllAsTouched();
            return;
        }

        const { start_date, end_date, reason, repeatYearly } =
            this.daysOffForm.value;

        this.unavailabilities.push({
            start_date,
            end_date,
            reason,
            repeatYearly,
        });

        this.closeDayOffModal();
    }

    removeUnavailability(index: number): void {
        this.unavailabilities.splice(index, 1);
        this.cdr.markForCheck();
    }

    onClose(): void {
        if (this.saving) return;
        this.closed.emit();
    }

    primaryAction(): void {
        if (this.currentStep < this.steps.length) {
            this.nextStep();
            return;
        }
        this.saveAll();
    }

    saveAll(): void {
        if (this.infoForm.invalid || this.saving) {
            this.infoForm.markAllAsTouched();
            return;
        }

        const info = this.infoForm.getRawValue();
        const specialtyFromSelection = Array.from(this.selectedSpecialtyIds)
            .map((id) => this.specialties.find((s) => s.id === id)?.name)
            .filter((v): v is string => !!v)
            .join(', ')
            .trim();

        this.schedules = this.weekSchedule
            .filter((d) => d.is_working_day)
            .map((d) => ({
                day_of_week: d.day_of_week,
                start_time: d.start_time,
                end_time: d.end_time,
                is_working_day: d.is_working_day,
            }));

        const payload: CreateDentistPayload = {
            ...info,
            nro_Id: Number(info.nro_Id),
            specialty:
                specialtyFromSelection || info.specialty || 'Sin especialidad',
        };

        this.saving = true;
        this.odontologoService
            .createDentist(payload)
            .pipe(
                switchMap((dentist) => {
                    const requests: Observable<unknown>[] = [];

                    if (this.schedules.length) {
                        const schedulesPayload: CreateSchedulePayload[] =
                            this.schedules.map((s) => ({
                                ...s,
                                dentistId: dentist.id,
                            }));
                        requests.push(
                            this.odontologoService.createSchedules(
                                schedulesPayload
                            )
                        );
                    }

                    if (this.unavailabilities.length) {
                        const unavailabilityRequests =
                            this.unavailabilities.map((item) =>
                                this.odontologoService.createUnavailability({
                                    dentistId: dentist.id,
                                    unavailable_date: new Date(item.start_date),
                                    reason: item.reason,
                                })
                            );
                        requests.push(forkJoin(unavailabilityRequests));
                    }

                    return requests.length
                        ? forkJoin(requests).pipe(map(() => dentist))
                        : of(dentist);
                })
            )
            .subscribe({
                next: (dentist) => {
                    this.created.emit(dentist);
                    this.resetForms();
                    this.saving = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.saving = false;
                    this.cdr.markForCheck();
                },
            });
    }

    private resetForms(): void {
        this.infoForm.reset({ isActive: true });
        this.schedules = [];
        this.unavailabilities = [];
        this.weekSchedule = [
            {
                day_of_week: 1,
                label: 'Lunes',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 2,
                label: 'Martes',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 3,
                label: 'Miércoles',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 4,
                label: 'Jueves',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 5,
                label: 'Viernes',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 6,
                label: 'Sábado',
                is_working_day: true,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
            {
                day_of_week: 0,
                label: 'Domingo',
                is_working_day: false,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
            },
        ];
        this.daysOffForm.reset({ repeatYearly: false });
        this.currentStep = 1;
    }

    private isCurrentStepValid(): boolean {
        if (this.currentStep === 1) {
            return this.infoForm.valid;
        }
        return true;
    }

    private markCurrentStepTouched(): void {
        if (this.currentStep === 1) {
            this.infoForm.markAllAsTouched();
        }
    }
}
