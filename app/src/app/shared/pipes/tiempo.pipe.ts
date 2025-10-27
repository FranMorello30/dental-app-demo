import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tiempo',
    standalone: true,
})
export class TiempoPipe implements PipeTransform {
    transform(value: string): string {
        if (value === 'TIEMPO_PARCIAL') return 'Tiempo Parcial';
        else return 'Tiempo Completo';
    }
}
