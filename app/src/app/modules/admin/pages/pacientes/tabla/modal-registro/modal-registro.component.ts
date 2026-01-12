import { AsyncPipe, CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Host,
    OnInit,
    inject,
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
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DefinicionesService } from '@shared/services/definiciones.service';
import { PacienteService } from '../../pacientes.service';
import { TablaComponent } from '../tabla.component';

@Component({
    selector: 'modal-registro-patient',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        AsyncPipe,
    ],
    templateUrl: './modal-registro.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { subscriptSizing: 'dynamic' },
        },
    ],
})
export class ModalRegistroPatientComponent implements OnInit {
    @Host() private padre = inject(TablaComponent);

    private readonly _formBuilder = inject(FormBuilder);
    private readonly _detectChange = inject(ChangeDetectorRef);
    private readonly _patientService = inject(PacienteService);
    private readonly _definicionService = inject(DefinicionesService);

    public isClosed = output<boolean>();

    public formulario: FormGroup<{
        dni: FormControl<string>;
        name: FormControl<string>;
        email: FormControl<string>;
        phone: FormControl<string>;
        address: FormControl<string>;
        date_of_birth: FormControl<string>;
        insurance: FormControl<string>;
        balance: FormControl<number>;
        notes: FormControl<string>;
        insurance_id: FormControl<string>;
    }>;

    ngOnInit(): void {
        this._createForm();
    }

    cerrarFormCita() {
        // Limpia slots y formulario

        this.formulario.reset();
        this.isClosed.emit(true);
    }

    grabarCita() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        this._patientService
            .createPatient(this.formulario.value as unknown)
            .subscribe({
                next: (response) => {
                    console.log('Paciente creado exitosamente:', response);
                    this.cerrarFormCita();
                    this.padre.getPatients(); // Actualiza la lista de pacientes
                },
                error: (error) => {
                    console.error('Error al crear el paciente:', error);
                },
            });
    }

    private _createForm() {
        this.formulario = this._formBuilder.group({
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
        });
    }
}
