import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-odontologos',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './odontologos.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontologosComponent {}
