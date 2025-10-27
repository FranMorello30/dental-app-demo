import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tabla',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
    templateUrl: './tabla.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComponent {
    private readonly _router = inject(Router);
    public initialPatients = [
        {
            id: 1,
            name: 'Dra Eduarliannys Rodriguez',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            especiality: 'Ortodoncia',
        },
    ];

    public irPerfil(id: number): void {
        this._router.navigate([`admin/odontologos/perfil/${id}`]);
    }
}
