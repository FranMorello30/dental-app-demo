import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FuseCardComponent } from '@fuse/components/card';
// Importa otros módulos de Angular Material que necesites
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatButtonModule,
        FuseCardComponent,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        MatTabsModule,
        MatSidenavModule,
        MatMenuModule,
        // Agrega otros módulos de Angular Material aquí
    ],
    exports: [
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatButtonModule,
        FuseCardComponent,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        MatTabsModule,
        MatSidenavModule,
        MatMenuModule,
        // Exporta los módulos de Angular Material aquí
    ],
})
export class SharedModule {}
