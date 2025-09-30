import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../services/icon';
import * as XLSX from 'xlsx'; // Correct XLSX import
import { saveAs } from 'file-saver'; // file-saver import

@Component({
  selector: 'app-button-export',
  standalone: true, // Componente standalone
  imports: [CommonModule],
  templateUrl: './button-export.html',
  styleUrl: './button-export.css',
})
export class ButtonExport {
  iconName = signal('download');
  label = signal('Export');
  size = input<number>(10);
  iconHref = computed(() => this.iconService.getIconHref(this.iconName()));

  // Required inputs
  nameOfTable = input.required<string>();
  data = input.required<any[]>();

  // Improved export function
  exportToExcel() {
    const data = this.data();
    
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      
      // Use the table name as the sheet name
      XLSX.utils.book_append_sheet(
        workbook, 
        worksheet, 
        this.nameOfTable().substring(0, 31) // Sheet names have 31 character limit
      );
      
      // Generate file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Filename with timestamp
      const fileName = `${this.nameOfTable()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Export error:', error);
    }
  }

  constructor(private iconService: IconService) {}
}