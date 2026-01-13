import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type EquipmentStatus = 'Operativo' | 'En mantenimiento' | 'Fuera de servicio';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    status: EquipmentStatus;
    quantity: number;
    nextMaintenance: string;
    location: string;
    provider: string;
}

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule],
    templateUrl: './inventario.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioComponent {
    constructor(private readonly _fb: FormBuilder) {}

    readonly equipment: InventoryItem[] = [
        {
            id: 1,
            name: 'Autoclave clase B',
            category: 'Esterilización',
            status: 'Operativo',
            quantity: 2,
            nextMaintenance: '2026-02-10',
            location: 'Esterilización',
            provider: 'SterilPro',
        },
        {
            id: 2,
            name: 'Sillón dental eléctrico',
            category: 'Equipamiento clínico',
            status: 'Operativo',
            quantity: 3,
            nextMaintenance: '2026-03-05',
            location: 'Consultorios 1-3',
            provider: 'DentalTech',
        },
        {
            id: 3,
            name: 'Lámpara de fotocurado LED',
            category: 'Equipamiento clínico',
            status: 'En mantenimiento',
            quantity: 1,
            nextMaintenance: '2026-01-25',
            location: 'Consultorio 2',
            provider: 'BlueCure',
        },
        {
            id: 4,
            name: 'Compresor libre de aceite',
            category: 'Soporte',
            status: 'Operativo',
            quantity: 1,
            nextMaintenance: '2026-04-15',
            location: 'Sala de máquinas',
            provider: 'AirMed',
        },
        {
            id: 5,
            name: 'Radiografía digital portátil',
            category: 'Diagnóstico',
            status: 'Operativo',
            quantity: 2,
            nextMaintenance: '2026-03-20',
            location: 'Consultorios 1-2',
            provider: 'X-RayOne',
        },
        {
            id: 6,
            name: 'Escáner intraoral',
            category: 'Diagnóstico',
            status: 'En mantenimiento',
            quantity: 1,
            nextMaintenance: '2026-02-28',
            location: 'Consultorio 3',
            provider: 'ScanDent',
        },
        {
            id: 7,
            name: 'Ultrasonido para profilaxis',
            category: 'Equipamiento clínico',
            status: 'Operativo',
            quantity: 2,
            nextMaintenance: '2026-02-18',
            location: 'Consultorios 1-2',
            provider: 'CleanWave',
        },
        {
            id: 8,
            name: 'Termodesinfectadora',
            category: 'Esterilización',
            status: 'Fuera de servicio',
            quantity: 1,
            nextMaintenance: '2026-01-30',
            location: 'Esterilización',
            provider: 'MediWash',
        },
    ];

    readonly categories = [
        'Equipamiento clínico',
        'Diagnóstico',
        'Esterilización',
        'Soporte',
        'Consumibles',
    ];

    readonly statuses: EquipmentStatus[] = [
        'Operativo',
        'En mantenimiento',
        'Fuera de servicio',
    ];

    readonly locations = [
        'Consultorio 1',
        'Consultorio 2',
        'Consultorio 3',
        'Esterilización',
        'Almacén',
        'Sala de máquinas',
    ];

    readonly createProductForm = this._fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        category: ['', Validators.required],
        status: ['Operativo' as EquipmentStatus, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        provider: ['', Validators.required],
        location: ['', Validators.required],
        nextMaintenance: ['', Validators.required],
        notes: [''],
    });

    get totalItems(): number {
        return this.equipment.length;
    }

    get activeItems(): number {
        return this.equipment.filter((item) => item.status === 'Operativo')
            .length;
    }

    get maintenanceItems(): number {
        return this.equipment.filter((item) => item.status !== 'Operativo')
            .length;
    }

    trackById(_: number, item: InventoryItem): number {
        return item.id;
    }

    submit(): void {
        if (this.createProductForm.invalid) {
            this.createProductForm.markAllAsTouched();
            return;
        }

        const payload = this.createProductForm.getRawValue();
        // Aquí iría la llamada al servicio; de momento dejamos el log.
        console.log('Producto a crear', payload);
        this.createProductForm.reset({
            name: '',
            category: '',
            status: 'Operativo',
            quantity: 1,
            provider: '',
            location: '',
            nextMaintenance: '',
            notes: '',
        });
    }
}
