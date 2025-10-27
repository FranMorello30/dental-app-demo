import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPanelComponent } from './header-panel/header-panel.component';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [RouterOutlet, HeaderPanelComponent],
    templateUrl: './admin.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
