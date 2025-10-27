import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DefinicionesService } from './definiciones.service';

const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    constructor(private readonly _defService: DefinicionesService) {}

    public exportExcel(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = {
            Sheets: { pagina: worksheet },
            SheetNames: ['pagina'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });
        this._saveAsExcel(excelBuffer, this._nombreArchivo(excelFileName));
    }
    public exportPdf(json: any[], columnas: any[], fileName: string): void {
        const doc = new jsPDF({ orientation: 'landscape' });
        const rows = [];
        json.forEach((element) => {
            const data = Object.values(element);
            rows.push(data);
        });
        //
        autoTable(doc, {
            tableWidth: 'auto',
            head: [columnas],
            body: [...rows],
        });
        doc.save(`${this._nombreArchivo(fileName)}.pdf`);
    }
    private _saveAsExcel(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName);
    }
    private _nombreArchivo(fileName: string): string {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = this._defService.retornarNomMes(date.getMonth() + 1);
        const year = date.getFullYear();
        return `${fileName}_${day}-${month}-${year}`;
    }
}
