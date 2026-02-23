import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnInit,
    SimpleChanges,
    inject,
    input,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TreatmentPlan } from '@shared/models/treatment-plan.model';
import { PacienteService } from '../../pacientes.service';
import { FormTratamientoComponent } from './form-tratamiento/form-tratamiento.component';

@Component({
    selector: 'plan-tratamiento',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule],
    templateUrl: './plan-tratamiento.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanTratamientoComponent implements OnInit, OnChanges {
    private readonly _matDialog = inject(MatDialog);
    private readonly _patientService = inject(PacienteService);
    private readonly _cdr = inject(ChangeDetectorRef);

    public patientId = input<string>('');

    public treatmentPlansData: Array<{
        id: string;
        name: string;
        description: string;
        startDate: string;
        estimatedEndDate: string | null;
        status: string;
        progress: number;
        totalCost: number;
        paidAmount: number;
        treatments: Array<{
            id: string;
            name: string;
            status: string;
            date: string;
        }>;
    }> = [];

    public isLoading = false;
    public errorMessage: string | null = null;

    ngOnInit(): void {
        this.loadTreatmentPlans();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['patientId'] && !changes['patientId'].firstChange) {
            this.loadTreatmentPlans();
        }
    }

    public openForm(): void {
        if (!this.patientId()) {
            this.errorMessage =
                'No se encontró el paciente para crear el plan.';
            this._cdr.markForCheck();
            return;
        }

        this._matDialog
            .open(FormTratamientoComponent, {
                disableClose: true,
                backdropClass: 'bg-transparent',
                data: {
                    patientId: this.patientId(),
                },
            })
            .afterClosed()
            .subscribe((saved: boolean) => {
                if (saved) {
                    this.loadTreatmentPlans();
                }
            });
    }

    public loadTreatmentPlans(): void {
        if (!this.patientId()) {
            this.treatmentPlansData = [];
            this.errorMessage = null;
            this._cdr.markForCheck();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        this._patientService.getTreatmentPlans().subscribe({
            next: (plans: TreatmentPlan[]) => {
                const patientPlans = plans
                    .filter((plan) => plan.patient?.id === this.patientId())
                    .map((plan) => ({
                        id: plan.id,
                        name: plan.name,
                        description: plan.description,
                        startDate: plan.start_date,
                        estimatedEndDate: plan.estimated_end_date,
                        status: plan.status,
                        progress: Number(plan.progress || 0),
                        totalCost: Number(plan.total_cost || 0),
                        paidAmount: Number(plan.paid_amount || 0),
                        treatments: (plan.procedures || []).map(
                            (procedure) => ({
                                id: procedure.id,
                                name: procedure.name,
                                status: procedure.status,
                                date:
                                    procedure.completed_date ||
                                    procedure.scheduled_date,
                            })
                        ),
                    }));

                this.treatmentPlansData = patientPlans;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.treatmentPlansData = [];
                this.errorMessage =
                    'No se pudieron cargar los planes de tratamiento.';
                this.isLoading = false;
                this._cdr.markForCheck();
            },
        });
    }

    formatDate(dateString: string | null | undefined) {
        if (!dateString) return 'No registrada';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}
