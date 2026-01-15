import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    output,
} from '@angular/core';
import { ImagenPipe } from '@shared/pipes/imagen.pipe';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';
import { SharedModule } from '@shared/shared.module';
import { UploadService } from './upload.service';

@Component({
    selector: 'upload-archivo',
    standalone: true,
    imports: [SharedModule, CommonModule, SafeUrlPipe, ImagenPipe],
    templateUrl: './upload-archivo.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class UploadArchivoComponent {
    private readonly _uploadService = inject(UploadService);
    private readonly _changeDetectorRef = inject(ChangeDetectorRef);
    public uploadAdjuntos = output<string[]>();
    public filesUploaded = output<any[]>();

    public filePreviewUrls: string[] = [];
    public uploadedFilesData: any[] = [];
    public archivos: any = [];
    subiendo = false;
    public capturarFile(event): void {
        this.archivos = [];
        const archivo = event.target.files[0];
        this.archivos.push(archivo);

        if (!event) {
            return;
        }
        this.subirArchivo();
    }
    private subirArchivo(): void {
        if (this.archivos.length > 0) {
            this.subiendo = true;
            try {
                const formularioDeDatos = new FormData();
                this.archivos.forEach((archivo) => {
                    formularioDeDatos.append('file', archivo);
                });

                this._uploadService.uploadArchivo(formularioDeDatos).subscribe(
                    (archivo: {
                        nombre: string;
                        nombreOriginal: string;
                        size: number;
                        ruta: string;
                    }) => {
                        this.subiendo = false;
                        this.filePreviewUrls.push(archivo.nombre);
                        this.uploadedFilesData.push(archivo);
                        this.uploadAdjuntos.emit(this.filePreviewUrls);
                        this.filesUploaded.emit(this.uploadedFilesData);
                        this._changeDetectorRef.detectChanges();
                    },
                    (err) => {}
                );
            } catch (error) {
                console.warn('ERROR', error);
            }
        }
    }
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        console.log('File selected:', input.files);

        if (!input.files) return;

        Array.from(input.files).forEach((file) => {
            console.warn('Processing file:', file);
            // if (file.type.startsWith('image/')) {
            //     const reader = new FileReader();
            //     reader.onload = (e) => {
            //         this.filePreviewUrls = [
            //             ...this.filePreviewUrls,
            //             e.target!.result as string,
            //         ];
            //     };
            //     reader.readAsDataURL(file);
            // } else {
            //     // para PDFs o archivos no imágenes mostramos solo el nombre
            //     this.filePreviewUrls = [...this.filePreviewUrls, file.name];
            // }

            // console.log('File preview URLs:', this.filePreviewUrls);
        });

        // opcional: limpiar selección para poder subir el mismo archivo de nuevo
        input.value = '';
    }

    removeFile(index: number): void {
        const next = [...this.filePreviewUrls];
        next.splice(index, 1);
        this.filePreviewUrls = next;
    }
}
