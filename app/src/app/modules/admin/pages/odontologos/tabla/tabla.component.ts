import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Dentist } from '@shared/models/dentist.model';
import { finalize } from 'rxjs/operators';
import { OdontologoService } from '../odontologos.service';
import { RegistroSidebarComponent } from '../registro-sidebar/registro-sidebar.component';

@Component({
    selector: 'app-tabla',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        RegistroSidebarComponent,
    ],
    templateUrl: './tabla.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly odontologoService = inject(OdontologoService);
    private readonly cdr = inject(ChangeDetectorRef);

    readonly dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    dentists: Dentist[] = [];
    loading = false;
    showSidebar = false;
    selectedDentist: Dentist | null = null;
    errorMessage: string | null = null;

    ngOnInit(): void {
        this.loadDentists();
    }

    loadDentists(): void {
        this.loading = true;
        this.errorMessage = null;
        this.odontologoService
            .getDentists()
            .pipe(finalize(() => this.cdr.markForCheck()))
            .subscribe({
                next: (dentists) => {
                    console.log(dentists);
                    this.dentists = dentists;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.errorMessage =
                        'No se pudieron cargar los odontólogos. Intenta nuevamente.';
                },
            });
    }

    openSidebar(dentist?: Dentist): void {
        this.selectedDentist = dentist ?? null;
        this.showSidebar = true;
    }

    closeSidebar(): void {
        this.showSidebar = false;
        this.selectedDentist = null;
    }

    handleCreated(dentist: Dentist): void {
        this.dentists = [dentist, ...this.dentists];
        this.showSidebar = false;
        this.selectedDentist = null;
        this.cdr.markForCheck();
    }

    handleUpdated(dentist: Dentist): void {
        this.dentists = this.dentists.map((item) =>
            item.id === dentist.id ? dentist : item
        );
        this.showSidebar = false;
        this.selectedDentist = null;
        this.cdr.markForCheck();
    }

    irPerfil(id: string): void {
        this.router.navigate([`admin/odontologos/perfil/${id}`]);
    }

    getSpecialtyDisplay(dentist: Dentist): string {
        const specialties = this.splitSpecialties(dentist.specialty);
        if (!specialties.length) return '—';
        if (specialties.length <= 2) return specialties.join(', ');
        const [first, second] = specialties;
        return `${first}, ${second} +${specialties.length - 2}`;
    }

    isWorkingDay(dentist: Dentist, dayIndex: number): boolean {
        return (
            Array.isArray(dentist.schedules) &&
            dentist.schedules.some(
                (schedule) =>
                    schedule.day_of_week === dayIndex && schedule.is_working_day
            )
        );
    }

    private splitSpecialties(raw: string): string[] {
        return (raw || '')
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item);
    }
}
