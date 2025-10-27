import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeHtml',
    standalone: true,
})
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) {}

    transform(value: any): SafeHtml {
        if (value == null) {
            return '';
        }

        return this._sanitizer.bypassSecurityTrustHtml(value);
    }
}
