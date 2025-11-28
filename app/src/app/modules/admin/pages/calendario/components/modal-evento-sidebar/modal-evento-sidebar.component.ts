import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '@shared/models/appointement.model';
import { OdontogramaSidebarComponent } from './odontograma/odontograma-sidebar.component';

@Component({
    selector: 'app-modal-evento-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        OdontogramaSidebarComponent,
    ],
    templateUrl: './modal-evento-sidebar.component.html',
})
export class ModalEventoSidebarComponent {
    selectedEvent = input.required<Appointment>();
    @Output() isClosed = new EventEmitter<void>();
    @Output() changedEvent = new EventEmitter<void>();
    isExpanded = false;
    activeView: 'habits' | 'odontogram' = 'habits';

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
    }

    setView(view: 'habits' | 'odontogram') {
        this.activeView = view;
        if (!this.isExpanded) {
            this.isExpanded = true;
        }
    }

    close() {
        this.isClosed.emit();
    }

    reschedule() {
        // Implement reschedule logic or emit event
        console.log('Reschedule clicked');
    }

    cancelAppointment() {
        // Implement cancel logic
        console.log('Cancel clicked');
    }
}
