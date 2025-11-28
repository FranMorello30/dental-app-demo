import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
interface TreatmentType {
    id: string;
    name: string;
    color: string;
}

interface TreatedTooth {
    toothNumber: number;
    treatmentId: string;
}
@Component({
    selector: 'odontograma',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './odontograma.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontogramaComponent {
    //@Input() selectedTeeth: TreatedTooth[] = [];
    @Output() selectedTeethChange = new EventEmitter<TreatedTooth[]>();

    treatedTeeth = [];
    selectedTeeth: TreatedTooth[] = [];
    treatments: TreatmentType[] = [
        { id: 'caries', name: 'Caries', color: '#e74c3c' },
        { id: 'extraction', name: 'Extracción', color: '#8e44ad' },
        { id: 'filling', name: 'Empaste', color: '#3498db' },
        { id: 'crown', name: 'Corona', color: '#f1c40f' },
        { id: 'root-canal', name: 'Endodoncia', color: '#e67e22' },
        { id: 'implant', name: 'Implante', color: '#2ecc71' },
    ];
    currentTreatment = this.treatments[0].id;
    upperTeeth = [
        [18, 17, 16, 15, 14, 13, 12, 11],
        [21, 22, 23, 24, 25, 26, 27, 28],
    ];

    lowerTeeth = [
        [48, 47, 46, 45, 44, 43, 42, 41],
        [31, 32, 33, 34, 35, 36, 37, 38],
    ];
    //    size: 'small' | 'medium' | 'large' = 'large';
    // sizeClasses = {
    //     small: {
    //         container: 'scale-75 origin-top-left',
    //         tooth: 'w-4 h-8',
    //         toothShape: 'w-3 h-4',
    //         text: 'text-[10px]',
    //         circle: 'h-2 w-2',
    //         legend: 'w-5 h-5',
    //         legendText: 'text-xs',
    //     },
    //     medium: {
    //         container: '',
    //         tooth: 'w-6 h-10',
    //         toothShape: 'w-5 h-6',
    //         text: 'text-xs',
    //         circle: 'h-3 w-3',
    //         legend: 'w-6 h-6',
    //         legendText: 'text-sm',
    //     },
    //     large: {
    //         container: 'scale-125 origin-top-left',
    //         tooth: 'w-7 h-12',
    //         toothShape: 'w-6 h-7',
    //         text: 'text-sm',
    //         circle: 'h-4 w-4',
    //         legend: 'w-7 h-7',
    //         legendText: 'text-base',
    //     },
    // };

    // get currentSize() {
    //     return this.sizeClasses[this.size];
    // }
    // getToothColor(toothNumber: number): string {
    //     const treatment = this.treatedTeeth.find(
    //         (t) => t.toothNumber === toothNumber
    //     );
    //     return treatment
    //         ? this.treatments.find((t) => t.id === treatment.treatmentId)
    //               ?.color ?? ''
    //         : '';
    // }
    // get usedTreatments(): TreatmentType[] {
    //     return this.treatments.filter((treatment) =>
    //         this.treatedTeeth.some(
    //             (tooth) => tooth.treatmentId === treatment.id
    //         )
    //     );
    // }

    isToothSelected(tooth: number): boolean {
        return this.selectedTeeth.some((t) => t.toothNumber === tooth);
    }

    getToothTreatment(tooth: number): string | null {
        const t = this.selectedTeeth.find((x) => x.toothNumber === tooth);
        return t ? t.treatmentId : null;
    }

    getToothColor(tooth: number): string {
        const id = this.getToothTreatment(tooth);
        return id ? this.treatments.find((t) => t.id === id)!.color : '';
    }

    handleToothClick(tooth: number) {
        console.log('Tooth clicked:', tooth);
        console.log('Current treatment:', this.currentTreatment);

        const idx = this.selectedTeeth.findIndex(
            (t) => t.toothNumber === tooth
        );
        const existing = this.selectedTeeth[idx];
        const next: TreatedTooth[] = [...this.selectedTeeth];

        if (existing && existing.treatmentId === this.currentTreatment) {
            next.splice(idx, 1);
        } else if (existing) {
            next[idx] = { ...existing, treatmentId: this.currentTreatment };
        } else {
            next.push({
                toothNumber: tooth,
                treatmentId: this.currentTreatment,
            });
        }

        // 1) Actualizamos el estado local
        this.selectedTeeth = next;
        // 2) Emitimos el nuevo array
        this.selectedTeethChange.emit(this.selectedTeeth);
    }
}
