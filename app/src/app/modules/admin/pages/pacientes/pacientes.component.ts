import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-pacientes',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './pacientes.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacientesComponent {}
