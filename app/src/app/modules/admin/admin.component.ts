import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './admin.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
