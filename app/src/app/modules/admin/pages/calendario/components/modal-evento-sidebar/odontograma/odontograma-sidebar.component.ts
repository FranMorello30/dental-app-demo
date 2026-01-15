import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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

@Component({
    selector: 'app-odontograma-sidebar',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './odontograma-sidebar.component.html',
})
export class OdontogramaSidebarComponent {
    @Input() selectedTeeth: Record<string, string> = {};
    @Output() selectedTeethChange = new EventEmitter<Record<string, string>>();

    currentCondition: string = 'blue';

    // Add this method to the FacturasComponent class
    hasSelectedTeeth(): boolean {
        return Object.keys(this.selectedTeeth).length > 0;
    }

    hasSeTeeth() {
        return Object.keys(this.selectedTeeth);
    }

    handleToothClick(toothId: string) {
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
        return this.selectedTeeth[toothId] || 'transparent';
    }

    clearAll() {
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

    conditions: Condition[] = [
        { id: 'blue', name: 'Tratamiento pendiente', color: '#90b3ff' },
        { id: 'red', name: 'Caries', color: '#ff9090' },
        { id: 'green', name: 'Tratado', color: '#90ff9d' },
        { id: 'yellow', name: 'En observación', color: '#ffec90' },
        { id: 'gray', name: 'Ausente', color: '#d0d0d0' },
    ];

    getConditionColor(conditionId: string): string | undefined {
        const condition = this.conditions.find((c) => c.id === conditionId);
        return condition?.color;
    }

    getConditionName(conditionId: string): string | undefined {
        console.log('conditionId', conditionId);
        const condition = this.conditions.find((c) => c.id === conditionId);
        return condition?.name;
    }

    getToothColor(toothValue: string): string {
        const condition = this.conditions.find((c) => c.id === toothValue);
        return condition ? condition.color : '#000';
    }
}
