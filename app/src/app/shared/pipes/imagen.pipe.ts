import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';

@Pipe({
    name: 'imagen',
    standalone: true,
})
export class ImagenPipe implements PipeTransform {
    private readonly baseUrl = environment.baseUrl;
    transform(img: string): string {
        if (img) {
            //
            return `${this.baseUrl}/uploads/${img}`;
        } else if (img.includes('https')) {
            return img;
        }
    }
    /**
     * else{
            return 'assets/images/apps/ecommerce/products/watch-01-thumb.jpg';
        }
     */
}
