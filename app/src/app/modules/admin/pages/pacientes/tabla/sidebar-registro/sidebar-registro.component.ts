import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Host,
    inject,
    OnInit,
    output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PacienteService } from '../../pacientes.service';
import { TablaComponent } from '../tabla.component';

@Component({
    selector: 'sidebar-registro-patient',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './sidebar-registro.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,

    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { subscriptSizing: 'dynamic' },
        },
    ],
})
export class SidebarRegistroPatientComponent implements OnInit {
    @Host() private padre = inject(TablaComponent);

    private readonly _formBuilder = inject(FormBuilder);
    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _patientService = inject(PacienteService);

    public isClosed = output<boolean>();

    steps = [
        { number: 1, title: 'Registro' },
        { number: 2, title: 'Hábitos' },
        { number: 3, title: 'Historial' },
        { number: 4, title: 'Adjuntos' },
    ];
    currentStep = 1;
    isSaving = false;

    uploadedFiles: File[] = [];

    public patientForm: FormGroup<{
        dni: FormControl<string>;
        name: FormControl<string>;
        phone: FormControl<string>;
        date_of_birth: FormControl<string>;
        email: FormControl<string>;
        insurance: FormControl<string>;
        insurance_id: FormControl<string>;
        habits: FormGroup<{
            smoking: FormControl<boolean>;
            alcohol: FormControl<boolean>;
            bruxism: FormControl<boolean>;
            brushingFrequency: FormControl<string>;
        }>;
        history: FormGroup<{
            allergies: FormControl<string>;
            medications: FormControl<string>;
            illnesses: FormControl<string>;
        }>;
    }>;

    ngOnInit(): void {
        this._createForm();
    }

    cerrarSidebar(): void {
        this.patientForm.reset();
        this.uploadedFiles = [];
        this.isClosed.emit(true);
    }

    nextStep(): void {
        if (!this._isCurrentStepValid()) {
            this.patientForm.markAllAsTouched();
            this._detectChange.markForCheck();
            return;
        }
        if (this.currentStep < this.steps.length) {
            this.currentStep++;
            this._detectChange.markForCheck();
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            this._detectChange.markForCheck();
        }
    }

    grabarPaciente(): void {
        if (!this._isCurrentStepValid()) {
            this.patientForm.markAllAsTouched();
            this._detectChange.markForCheck();
            return;
        }

        if (this.currentStep < this.steps.length) {
            this.currentStep++;
            this._detectChange.markForCheck();
            return;
        }

        if (this.patientForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._patientService
            .createPatient(this.patientForm.value as unknown)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.cerrarSidebar();
                    this.padre.getPatients();
                },
                error: (error) => {
                    console.error('Error al crear el paciente:', error);
                    this.isSaving = false;
                    this._detectChange.markForCheck();
                },
            });
    }

    private _createForm(): void {
        this.patientForm = this._formBuilder.group({
            dni: ['', [Validators.required, Validators.minLength(7)]],
            name: ['', [Validators.required, Validators.minLength(3)]],
            phone: ['', [Validators.required, Validators.minLength(10)]],
            date_of_birth: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            insurance: [''],
            insurance_id: [''],
            habits: this._formBuilder.group({
                smoking: [false],
                alcohol: [false],
                bruxism: [false],
                brushingFrequency: [''],
            }),
            history: this._formBuilder.group({
                allergies: [''],
                medications: [''],
                illnesses: [''],
            }),
        });
    }

    private _isCurrentStepValid(): boolean {
        // Step 1 checks all required personal data shown on that step
        if (this.currentStep === 1) {
            return (
                this.patientForm.get('dni')!.valid &&
                this.patientForm.get('name')!.valid &&
                this.patientForm.get('phone')!.valid &&
                this.patientForm.get('date_of_birth')!.valid &&
                this.patientForm.get('email')!.valid
            );
        }

        // Following steps are optional; full form validity is enforced before save
        return true;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        this.uploadedFiles = [
            ...this.uploadedFiles,
            ...Array.from(input.files),
        ];
        this._detectChange.markForCheck();
    }

    removeFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
        this.uploadedFiles = [...this.uploadedFiles];
        this._detectChange.markForCheck();
    }
}
