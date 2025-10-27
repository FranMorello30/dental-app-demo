import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@environments/environment';

import { Dentist } from '@shared/models/dentist.model';
import Swal from 'sweetalert2';
export const MY_DATE_FORMATS = {
    parse: {
        dateInput: '  YYYY/MM/DD',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
@Injectable({
    providedIn: 'root',
})
export class DefinicionesService {
    private baseUrl = environment.baseUrl;

    constructor(private _http: HttpClient) {}

    public reemplazarCaracter(search: string, replace: string, sujeto: any) {
        const result = [];
        const _string = sujeto.toLowerCase();
        const _search = search.toLowerCase();
        let start = 0;
        let match;
        const length = _search.length;
        while ((match = _string.indexOf(_search, start)) >= 0) {
            result.push(sujeto.slice(start, match));
            start = match + length;
        }
        result.push(sujeto.slice(start));

        return result.join(replace);
    }
    public alertaMensaje(
        mensaje: string
    ): Promise<import('sweetalert2').SweetAlertResult<any>> {
        const ventanaToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });

        return ventanaToast.fire({
            icon: 'success',
            title: mensaje,
        });
    }
    public isDayAvailable(date: Date, dentist: Dentist): boolean {
        const days = dentist.schedules.map((schedule) => {
            return schedule.is_working_day ? schedule.day_of_week : null;
        });

        const config = days;
        const dayOfWeek = date.getDay();
        let available = config.includes(dayOfWeek);

        if (
            dentist &&
            dentist.unavailabilities &&
            dentist.unavailabilities.length > 0
        ) {
            const dateToCheck = new Date(date);

            dateToCheck.setHours(0, 0, 0, 0);
            const isUnavailable = dentist.unavailabilities.some((u) => {
                const unavailDate = new Date(u.unavailable_date + 'T00:00:00');

                unavailDate.setHours(0, 0, 0, 0);
                return unavailDate.getTime() === dateToCheck.getTime();
            });
            available = available && !isUnavailable;
        }
        return available;
    }
    public getAvailableTimesForDay(date: Date, dentist: Dentist): string[] {
        // Verificar si el día está disponible para el odontólogo
        if (!this.isDayAvailable(date, dentist)) {
            return [];
        }

        // Buscar el horario del odontólogo para el día de la semana
        const dayOfWeek = date.getDay();
        const schedule = dentist.schedules.find(
            (s) => s.day_of_week === dayOfWeek && s.is_working_day
        );

        if (!schedule) {
            return [];
        }

        // Obtener hora de inicio y fin del horario
        const startHour = schedule.start_time
            ? parseInt(schedule.start_time.split(':')[0], 10)
            : 9;
        const endHour = schedule.end_time
            ? parseInt(schedule.end_time.split(':')[0], 10)
            : 17;

        console.warn({ startHour, endHour });

        // Obtener los breaks (pausas) si existen
        const breaks = Array.isArray(schedule.breaks)
            ? schedule.breaks.map((b) => ({
                  start: b.start_time,
                  end: b.end_time,
              }))
            : [];

        const availableTimes: string[] = [];
        const startTimeInMinutes = startHour * 60;
        const endTimeInMinutes = endHour * 60;

        let currentTime = startTimeInMinutes;

        while (currentTime < endTimeInMinutes) {
            let overlapsBreak = false;
            for (const breakTime of breaks) {
                const [breakStartHour, breakStartMinute] = breakTime.start
                    .split(':')
                    .map(Number);
                const [breakEndHour, breakEndMinute] = breakTime.end
                    .split(':')
                    .map(Number);

                const breakStart = breakStartHour * 60 + breakStartMinute;
                const breakEnd = breakEndHour * 60 + breakEndMinute;

                if (currentTime >= breakStart && currentTime < breakEnd) {
                    overlapsBreak = true;
                    break;
                }
            }

            if (!overlapsBreak) {
                const hour = Math.floor(currentTime / 60);
                const minute = currentTime % 60;
                const timeString =
                    hour.toString().padStart(2, '0') +
                    ':' +
                    minute.toString().padStart(2, '0');
                availableTimes.push(timeString);
            }

            currentTime += 30;
        }

        return availableTimes;
    }

    public calculateEndTime(startTime: string) {
        if (!startTime) return '';

        const [hours, minutes] = startTime.split(':').map(Number);
        let endHour = hours;
        let endMinute = minutes + 30; // Por defecto, 30 minutos de duración

        if (endMinute >= 60) {
            endHour += 1;
            endMinute -= 60;
        }

        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    }
}
