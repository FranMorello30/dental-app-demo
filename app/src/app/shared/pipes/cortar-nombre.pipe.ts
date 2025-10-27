import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cortarNombre',
    standalone: true,
})
export class CortarNombrePipe implements PipeTransform {
    transform(value: string): string {
        const cadena = value.split(' ');

        return cadena[0];
    }
}
