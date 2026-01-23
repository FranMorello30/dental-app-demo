import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
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
import { Dentist, Schedules } from '@shared/models/dentist.model';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
    CreateBreakPayload,
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
    breaks: BreakDraft[];
}

interface BreakDraft {
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
    changeDetection: ChangeDetectionStrategy.Default,
})
export class RegistroSidebarComponent {
    private readonly odontologoService = inject(OdontologoService);
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly defaultStart = '08:00';
    private readonly defaultEnd = '17:00';

    private editingDentistId: string | null = null;
    private pendingSpecialtyNames: string[] = [];

    @Input() set dentist(value: Dentist | null) {
        if (!value) {
            this.setCreateMode();
            return;
        }
        this.setEditMode(value);
    }

    @Output() closed = new EventEmitter<void>();
    @Output() created = new EventEmitter<Dentist>();
    @Output() updated = new EventEmitter<Dentist>();

    saving = false;
    isEditMode = false;
    schedules: LocalSchedule[] = [];
    unavailabilities: LocalUnavailability[] = [];
    specialties: Specialty[] = [];
    selectedSpecialtyIds = new Set<string>();

    weekSchedule: WeekDaySchedule[] = this.createWeekSchedule(true);

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

    private loadSpecialties(): void {
        this.odontologoService.getSpecialties().subscribe({
            next: (data) => {
                this.specialties = data;
                this.syncSelectedSpecialties();
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
        } else {
            day.breaks = [];
        }
        this.cdr.detectChanges();
    }

    addBreak(day: WeekDaySchedule): void {
        day.breaks.push({ start_time: '', end_time: '' });
        this.cdr.markForCheck();
    }

    removeBreak(day: WeekDaySchedule, index: number): void {
        day.breaks.splice(index, 1);
        this.cdr.markForCheck();
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

        if (this.isEditMode && this.editingDentistId) {
            const dentistId = this.editingDentistId;
            const schedulePayload: CreateSchedulePayload[] = this.schedules.map(
                (s) => ({
                    ...s,
                    dentistId,
                })
            );
            const unavailabilityPayload: CreateUnavailabilityPayload[] =
                this.unavailabilities.map((item) => ({
                    dentistId,
                    unavailable_date: new Date(item.start_date),
                    reason: item.reason,
                }));

            this.odontologoService
                .updateDentist(dentistId, payload)
                .pipe(
                    switchMap((dentist) =>
                        this.odontologoService
                            .replaceSchedules(dentistId, schedulePayload)
                            .pipe(
                                switchMap((schedules: Schedules[]) => {
                                    const breakRequests =
                                        this.buildBreakRequestsForSchedules(
                                            schedules
                                        );
                                    const breaks$ = breakRequests.length
                                        ? forkJoin(breakRequests)
                                        : of([]);

                                    return forkJoin({
                                        dentist: of(dentist),
                                        unavailabilities:
                                            this.odontologoService.replaceUnavailability(
                                                dentistId,
                                                unavailabilityPayload
                                            ),
                                        breaks: breaks$,
                                    });
                                })
                            )
                    )
                )
                .subscribe({
                    next: ({ dentist }) => {
                        this.updated.emit(dentist);
                        this.saving = false;
                        this.cdr.markForCheck();
                    },
                    error: () => {
                        this.saving = false;
                        this.cdr.markForCheck();
                    },
                });

            return;
        }

        this.odontologoService
            .createDentist(payload)
            .pipe(
                switchMap((dentist) => {
                    const schedulesPayload: CreateSchedulePayload[] =
                        this.schedules.map((s) => ({
                            ...s,
                            dentistId: dentist.id,
                        }));

                    const schedules$ = schedulesPayload.length
                        ? this.odontologoService.createSchedules(
                              schedulesPayload
                          )
                        : of([] as Schedules[]);

                    const unavailabilityRequests = this.unavailabilities.map(
                        (item) =>
                            this.odontologoService.createUnavailability({
                                dentistId: dentist.id,
                                unavailable_date: new Date(item.start_date),
                                reason: item.reason,
                            })
                    );
                    const unavailabilities$ = unavailabilityRequests.length
                        ? forkJoin(unavailabilityRequests)
                        : of([]);

                    return schedules$.pipe(
                        switchMap((schedules: Schedules[]) => {
                            const breakRequests =
                                this.buildBreakRequestsForSchedules(schedules);
                            const breaks$ = breakRequests.length
                                ? forkJoin(breakRequests)
                                : of([]);
                            return forkJoin({
                                dentist: of(dentist),
                                unavailabilities: unavailabilities$,
                                breaks: breaks$,
                            });
                        })
                    );
                })
            )
            .subscribe({
                next: ({ dentist }) => {
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
        this.weekSchedule = this.createWeekSchedule(true);
        this.daysOffForm.reset({ repeatYearly: false });
        this.selectedSpecialtyIds.clear();
        this.pendingSpecialtyNames = [];
        this.currentStep = 1;
    }

    private setCreateMode(): void {
        this.isEditMode = false;
        this.editingDentistId = null;
        this.resetForms();
        this.cdr.markForCheck();
    }

    private setEditMode(dentist: Dentist): void {
        this.isEditMode = true;
        this.editingDentistId = dentist.id;
        this.currentStep = 1;
        this.selectedSpecialtyIds.clear();
        this.pendingSpecialtyNames = this.extractSpecialtyNames(
            dentist.specialty
        );

        this.infoForm.patchValue({
            name: dentist.name,
            phone: dentist.phone,
            email: dentist.email,
            specialty: dentist.specialty,
            nro_Id: dentist.nro_Id,
            license_number: dentist.license_number,
            avatar: dentist.avatar,
            notes: dentist.notes,
            isActive: dentist.is_active,
        });

        this.weekSchedule = this.createWeekSchedule(false);
        this.unavailabilities = [];
        this.loadDentistDetails(dentist.id);
        this.syncSelectedSpecialties();
        this.cdr.markForCheck();
    }

    private loadDentistDetails(dentistId: string): void {
        forkJoin({
            schedules: this.odontologoService.getSchedule(dentistId),
            unavailabilities:
                this.odontologoService.getUnavailability(dentistId),
        }).subscribe({
            next: ({ schedules, unavailabilities }) => {
                this.weekSchedule = this.createWeekSchedule(false);
                schedules.forEach((schedule) => {
                    const day = this.weekSchedule.find(
                        (item) => item.day_of_week === schedule.day_of_week
                    );
                    if (!day) return;
                    day.is_working_day = schedule.is_working_day ?? true;
                    day.start_time =
                        this.formatTime(schedule.start_time) ||
                        this.defaultStart;
                    day.end_time =
                        this.formatTime(schedule.end_time) || this.defaultEnd;
                    day.breaks =
                        schedule.breaks?.map((item) => ({
                            start_time: this.formatTime(item.start_time),
                            end_time: this.formatTime(item.end_time),
                        })) ?? [];
                });

                this.unavailabilities = unavailabilities.map((item) => {
                    const date = this.formatDate(item.unavailable_date);
                    return {
                        start_date: date,
                        end_date: date,
                        reason: item.reason,
                        repeatYearly: false,
                    };
                });

                this.cdr.markForCheck();
            },
            error: () => {
                this.cdr.markForCheck();
            },
        });
    }

    private createWeekSchedule(defaultWorkingDay: boolean): WeekDaySchedule[] {
        return [
            {
                day_of_week: 1,
                label: 'Lunes',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 2,
                label: 'Martes',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 3,
                label: 'Miércoles',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 4,
                label: 'Jueves',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 5,
                label: 'Viernes',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 6,
                label: 'Sábado',
                is_working_day: defaultWorkingDay,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
            {
                day_of_week: 0,
                label: 'Domingo',
                is_working_day: false,
                start_time: this.defaultStart,
                end_time: this.defaultEnd,
                breaks: [],
            },
        ];
    }

    private extractSpecialtyNames(value: string): string[] {
        if (!value) return [];
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item);
    }

    private syncSelectedSpecialties(): void {
        if (!this.pendingSpecialtyNames.length || !this.specialties.length) {
            return;
        }

        const selectedIds = this.specialties
            .filter((item) => this.pendingSpecialtyNames.includes(item.name))
            .map((item) => item.id);

        this.selectedSpecialtyIds = new Set(selectedIds);
        this.cdr.markForCheck();
    }

    private formatDate(value: Date | string): string {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private formatTime(value: string | null | undefined): string {
        if (!value) return '';
        const [hours, minutes] = value.split(':');
        if (!hours || minutes === undefined) return '';
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    private buildBreakRequestsForSchedules(
        schedules: Schedules[]
    ): Observable<void>[] {
        return schedules.flatMap((schedule) => {
            const day = this.weekSchedule.find(
                (item) => item.day_of_week === schedule.day_of_week
            );
            if (!day?.is_working_day || !day.breaks.length) return [];
            return day.breaks
                .filter((item) => item.start_time && item.end_time)
                .map(
                    (item): Observable<void> =>
                        this.odontologoService.createBreak({
                            scheduleId: schedule.id,
                            start_time: item.start_time,
                            end_time: item.end_time,
                        } as CreateBreakPayload)
                );
        });
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
