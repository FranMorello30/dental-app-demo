import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    OdontologoService,
    Specialty,
} from '@modules/admin/pages/odontologos/odontologos.service';

@Component({
    selector: 'app-configuraciones',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './configuraciones.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionesComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly odontologoService = inject(OdontologoService);

    lastSavedAt: Date | null = null;
    saving = false;
    specialties: Specialty[] = [];
    specialtiesLoading = false;
    specialtiesSaving = false;
    specialtiesError: string | null = null;

    readonly timezoneOptions = [
        'America/Caracas',
        'America/Bogota',
        'America/Mexico_City',
        'America/Santiago',
        'America/Lima',
        'Europe/Madrid',
    ];

    readonly currencyOptions = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'VES', label: 'VES (Bs.)' },
        { value: 'COP', label: 'COP ($)' },
        { value: 'PEN', label: 'PEN (S/)' },
    ];

    readonly defaultValues = {
        clinicName: 'Dental Care',
        clinicEmail: 'contacto@dentalcare.com',
        clinicPhone: '+58 424-0000000',
        clinicAddress: 'Av. Principal, Piso 2',
        timezone: 'America/Caracas',
        currency: 'USD',
        appointmentSlotMinutes: 30,
        defaultStartTime: '08:00',
        defaultEndTime: '17:00',
        allowOverbooking: false,
        requireConfirmation: true,
        sendEmailReminders: true,
        sendWhatsappReminders: false,
        reminderHoursBefore: 24,
        enableAuditLog: true,
        enableTwoFactor: false,
        brandPrimary: '#2563EB',
        brandSecondary: '#0F172A',
    };

    form: FormGroup = this.fb.group({
        clinicName: [this.defaultValues.clinicName, Validators.required],
        clinicEmail: [
            this.defaultValues.clinicEmail,
            [Validators.required, Validators.email],
        ],
        clinicPhone: [this.defaultValues.clinicPhone, Validators.required],
        clinicAddress: [this.defaultValues.clinicAddress],
        timezone: [this.defaultValues.timezone, Validators.required],
        currency: [this.defaultValues.currency, Validators.required],
        appointmentSlotMinutes: [
            this.defaultValues.appointmentSlotMinutes,
            [Validators.required, Validators.min(10), Validators.max(120)],
        ],
        defaultStartTime: [
            this.defaultValues.defaultStartTime,
            Validators.required,
        ],
        defaultEndTime: [
            this.defaultValues.defaultEndTime,
            Validators.required,
        ],
        allowOverbooking: [this.defaultValues.allowOverbooking],
        requireConfirmation: [this.defaultValues.requireConfirmation],
        sendEmailReminders: [this.defaultValues.sendEmailReminders],
        sendWhatsappReminders: [this.defaultValues.sendWhatsappReminders],
        reminderHoursBefore: [
            this.defaultValues.reminderHoursBefore,
            [Validators.required, Validators.min(1), Validators.max(168)],
        ],
        enableAuditLog: [this.defaultValues.enableAuditLog],
        enableTwoFactor: [this.defaultValues.enableTwoFactor],
        brandPrimary: [this.defaultValues.brandPrimary, Validators.required],
        brandSecondary: [
            this.defaultValues.brandSecondary,
            Validators.required,
        ],
    });

    specialtyForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
    });

    ngOnInit(): void {
        this.loadSpecialties();
    }

    saveSettings(): void {
        if (this.form.invalid || this.saving) {
            this.form.markAllAsTouched();
            return;
        }
        this.saving = true;
        setTimeout(() => {
            this.lastSavedAt = new Date();
            this.saving = false;
        }, 400);
    }

    resetDefaults(): void {
        this.form.reset(this.defaultValues);
    }

    loadSpecialties(): void {
        this.specialtiesLoading = true;
        this.specialtiesError = null;
        this.odontologoService.getSpecialties().subscribe({
            next: (data) => {
                this.specialties = data;
                this.specialtiesLoading = false;
            },
            error: () => {
                this.specialties = [];
                this.specialtiesLoading = false;
                this.specialtiesError =
                    'No se pudieron cargar las especialidades.';
            },
        });
    }

    addSpecialty(): void {
        if (this.specialtyForm.invalid || this.specialtiesSaving) {
            this.specialtyForm.markAllAsTouched();
            return;
        }

        const payload = this.specialtyForm.getRawValue();
        this.specialtiesSaving = true;
        this.specialtiesError = null;
        this.odontologoService.createSpecialty(payload).subscribe({
            next: (specialty) => {
                this.specialties = [specialty, ...this.specialties];
                this.specialtyForm.reset();
                this.specialtiesSaving = false;
            },
            error: () => {
                this.specialtiesSaving = false;
                this.specialtiesError = 'No se pudo guardar la especialidad.';
            },
        });
    }
}
