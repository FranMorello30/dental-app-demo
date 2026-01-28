import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    inject,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
interface Tooth {
    id: string;
    x: number;
    y: number;
}
interface Condition {
    id: string;
    name: string;
    color: string;
}
interface TreatmentTeethResponse {
    treatment_teeth: Array<{
        id: string;
        color: string;
        treatment: string;
    }>;
}

@Component({
    selector: 'app-odontograma-sidebar',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './odontograma-sidebar.component.html',
})
export class OdontogramaSidebarComponent implements OnInit {
    private readonly _http = inject(HttpClient);
    private readonly _cdr = inject(ChangeDetectorRef);
    @Input() selectedTeeth: Record<string, string> = {};
    @Input() readOnly = false;
    @Output() selectedTeethChange = new EventEmitter<Record<string, string>>();

    currentCondition: string = '';

    ngOnInit(): void {
        this.loadTreatmentOptions();
        console.log('Selected teeth:', this.selectedTeeth);
    }

    // Add this method to the FacturasComponent class
    hasSelectedTeeth(): boolean {
        return Object.keys(this.selectedTeeth).length > 0;
    }

    hasSeTeeth() {
        return Object.keys(this.selectedTeeth);
    }

    handleToothClick(toothId: string) {
        if (this.readOnly) return;
        console.log({ toothId, condicion: this.currentCondition });
        const newState = { ...this.selectedTeeth };

        if (this.selectedTeeth[toothId] === this.currentCondition) {
            delete newState[toothId];
        } else {
            newState[toothId] = this.currentCondition;
        }

        this.selectedTeeth = newState;
        this.selectedTeethChange.emit(this.selectedTeeth);
    }

    getToothFill(toothId: string) {
        const conditionId = this.selectedTeeth[toothId];
        if (!conditionId) return 'transparent';
        return this.getConditionColor(conditionId) ?? 'transparent';
    }

    clearAll() {
        if (this.readOnly) return;
        this.selectedTeeth = {};
        this.selectedTeethChange.emit(this.selectedTeeth);
    }

    upperTeeth: Tooth[] = [
        { id: '18', x: 82, y: 345 },
        { id: '17', x: 92, y: 295 },
        { id: '16', x: 105, y: 248 },
        { id: '15', x: 120, y: 205 },
        { id: '14', x: 135, y: 170 },
        { id: '13', x: 158, y: 130 },
        { id: '12', x: 188, y: 100 },
        { id: '11', x: 233, y: 85 },
        { id: '21', x: 283, y: 85 },
        { id: '22', x: 325, y: 100 },
        { id: '23', x: 360, y: 130 },
        { id: '24', x: 388, y: 167 },
        { id: '25', x: 405, y: 205 },
        { id: '26', x: 420, y: 245 },
        { id: '27', x: 430, y: 295 },
        { id: '28', x: 440, y: 345 },
    ];

    lowerTeeth: Tooth[] = [
        { id: '48', x: 80, y: 430 },
        { id: '47', x: 90, y: 480 },
        { id: '46', x: 96, y: 530 },
        { id: '45', x: 110, y: 570 },
        { id: '44', x: 130, y: 610 },
        { id: '43', x: 160, y: 640 },
        { id: '42', x: 200, y: 660 },
        { id: '41', x: 240, y: 670 },
        { id: '31', x: 280, y: 670 },
        { id: '32', x: 320, y: 665 },
        { id: '33', x: 356, y: 645 },
        { id: '34', x: 390, y: 615 },
        { id: '35', x: 410, y: 578 },
        { id: '36', x: 425, y: 533 },
        { id: '37', x: 435, y: 481 },
        { id: '38', x: 445, y: 430 },
    ];

    conditions: Condition[] = [];

    private loadTreatmentOptions(): void {
        this._http
            .get<TreatmentTeethResponse>(
                'http://localhost:4978/api/medical-histories/treatment-teeth'
            )
            .subscribe({
                next: (response) => {
                    this.conditions = (response.treatment_teeth ?? []).map(
                        (item) => ({
                            id: item.id,
                            name: item.treatment,
                            color: item.color,
                        })
                    );
                    this.currentCondition =
                        this.conditions[0]?.id ?? this.currentCondition;
                    console.log('Loaded conditions:', this.conditions);
                    this._cdr.markForCheck();
                },
                error: (error) => {
                    console.error(
                        'Error loading treatment teeth options',
                        error
                    );
                },
            });
    }

    getConditionColor(conditionId: string): string | undefined {
        const condition = this.conditions.find((c) => c.id === conditionId);
        return condition?.color;
    }

    getConditionName(conditionId: string): string | undefined {
        const condition = this.conditions.find((c) => c.id === conditionId);
        return condition?.name;
    }

    getToothColor(toothValue: string): string {
        const condition = this.conditions.find((c) => c.id === toothValue);
        return condition ? condition.color : '#000';
    }
}
