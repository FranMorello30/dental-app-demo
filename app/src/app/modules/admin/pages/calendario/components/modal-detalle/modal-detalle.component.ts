import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    OnDestroy,
    OnInit,
    output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

import { format } from 'date-fns';

import { OdontogramaComponent } from '@shared/components/odontograma/odontograma.component';
import { UploadArchivoComponent } from '@shared/components/upload-archivo/upload-archivo.component';
import { Appointment } from '@shared/models/appointement.model';

@Component({
    selector: 'modal-detalle',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        OdontogramaComponent,
        UploadArchivoComponent,
    ],
    templateUrl: './modal-detalle.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDetalleComponent implements OnInit, OnDestroy {
    public appointment = input.required<Appointment>();
    public isClosed = output<boolean>();

    public weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    public dateSelected: Date;
    public currentDate: Date = new Date();
    public trabajoRealizado = new FormControl('');
    public notasAdicionales = new FormControl('');

    ngOnInit(): void {
        document.body.style.overflow = 'hidden';
    }
    ngOnDestroy(): void {
        document.body.style.overflow = '';
    }

    cerrarFormCita() {
        document.body.style.overflow = '';
        this.isClosed.emit(true);
    }
    comparedDate(day: number) {
        if (!this.dateSelected) return false;
        return (
            this.dateSelected.getDate() === day &&
            this.dateSelected.getMonth() === this.currentDate.getMonth() &&
            this.dateSelected.getFullYear() === this.currentDate.getFullYear()
        );
    }
    getPastDay(day) {
        const date = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        const isCurrentDay =
            day === this.currentDate.getDate() &&
            this.currentDate.getMonth() === new Date().getMonth() &&
            this.currentDate.getFullYear() === new Date().getFullYear();

        return this.isPastDate(date);
    }
    isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate < today) {
            return true;
        }
        return !this.isDayAvailable(compareDate);
    }
    isDayAvailable(date: Date): boolean {
        const dayOfWeek = date.getDay();
        return true;
    }
    getFormattedDate(): string {
        return format(this.currentDate, 'MMMM yyyy');
    }
    goToPrevious(): void {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        this.currentDate = newDate;
        this.getMiniCalendarData();
    }
    goToNext() {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        this.currentDate = newDate;
        this.getMiniCalendarData();
    }
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    getMiniCalendarData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

        return Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) =>
            i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
        );
    }
    teethSeleted(selectedTeeth: any[]) {
        console.log('detalle selected teeth:', selectedTeeth);
        // Aquí puedes manejar los dientes seleccionados como desees
    }
    uploadFiles(files: string[]) {
        console.log('Files uploaded:', files);
        // Aquí puedes manejar los archivos subidos como desees
    }
    grabarDetalle() {
        const trabajoRealizado = this.trabajoRealizado.value;
        const notasAdicionales = this.notasAdicionales.value;

        // Aquí puedes manejar el guardado de los detalles del tratamiento
        console.log('Trabajo Realizado:', trabajoRealizado);
        console.log('Notas Adicionales:', notasAdicionales);

        // Emitir el evento para cerrar el modal
        this.isClosed.emit(true);
    }
}
