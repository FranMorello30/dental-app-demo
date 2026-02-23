import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
    CreateTreatmentPlanPayload,
    CreateTreatmentProcedurePayload,
} from '@shared/models/treatment-plan.model';
import { PacienteService } from '../../../pacientes.service';

@Component({
    selector: 'form-tratamiento',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, FormsModule],
    templateUrl: './form-tratamiento.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTratamientoComponent {
    public readonly matDialogRef = inject(
        MatDialogRef<FormTratamientoComponent>
    );
    private readonly _patientService = inject(PacienteService);
    private readonly _cdr = inject(ChangeDetectorRef);

    public readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as {
        patientId?: string;
    } | null;

    public newTreatmentForm = false;
    public isSaving = false;
    public errorMessage: string | null = null;

    public planDraft = {
        name: '',
        description: '',
        start_date: '',
        estimated_end_date: '',
        notes: '',
    };

    public treatmentDraft = {
        name: '',
        description: '',
        cost: 0,
        scheduled_date: '',
    };

    public treatments: CreateTreatmentProcedurePayload[] = [];

    cerrarForm() {
        this.matDialogRef.close(false);
    }

    crearTreatment() {
        this.errorMessage = null;

        if (
            !this.treatmentDraft.name.trim() ||
            !this.treatmentDraft.description.trim() ||
            !this.treatmentDraft.scheduled_date ||
            Number(this.treatmentDraft.cost) <= 0
        ) {
            this.errorMessage =
                'Completa nombre, descripción, fecha y costo válido del tratamiento.';
            this._cdr.markForCheck();
            return;
        }

        this.treatments.push({
            name: this.treatmentDraft.name.trim(),
            description: this.treatmentDraft.description.trim(),
            cost: Number(this.treatmentDraft.cost),
            scheduled_date: this.treatmentDraft.scheduled_date,
        });

        this.treatmentDraft = {
            name: '',
            description: '',
            cost: 0,
            scheduled_date: '',
        };
        this.newTreatmentForm = false;
        this._cdr.markForCheck();
    }

    removeTreatment(index: number): void {
        this.treatments.splice(index, 1);
        this._cdr.markForCheck();
    }

    get totalCost(): number {
        return this.treatments.reduce(
            (sum, treatment) => sum + Number(treatment.cost || 0),
            0
        );
    }

    savePlan(): void {
        this.errorMessage = null;

        if (!this.data?.patientId) {
            this.errorMessage = 'No se encontró el paciente del plan.';
            this._cdr.markForCheck();
            return;
        }

        if (!this.planDraft.name.trim() || !this.planDraft.start_date) {
            this.errorMessage =
                'El nombre del plan y la fecha de inicio son obligatorios.';
            this._cdr.markForCheck();
            return;
        }

        if (this.treatments.length === 0) {
            this.errorMessage =
                'Debes agregar al menos un tratamiento al plan.';
            this._cdr.markForCheck();
            return;
        }

        this.isSaving = true;

        const payload: CreateTreatmentPlanPayload = {
            name: this.planDraft.name.trim(),
            description: this.planDraft.description.trim() || 'Sin descripción',
            start_date: this.planDraft.start_date,
            estimated_end_date: this.planDraft.estimated_end_date || undefined,
            progress: 0,
            total_cost: this.totalCost,
            paid_amount: 0,
            status: 'pendiente',
            patientId: this.data.patientId,
            procedures: this.treatments,
        };

        this._patientService.createTreatmentPlan(payload).subscribe({
            next: () => {
                this.isSaving = false;
                this.matDialogRef.close(true);
            },
            error: (error) => {
                this.isSaving = false;
                this.errorMessage =
                    error?.error?.message || 'No se pudo guardar el plan.';
                this._cdr.markForCheck();
            },
        });
    }
}
