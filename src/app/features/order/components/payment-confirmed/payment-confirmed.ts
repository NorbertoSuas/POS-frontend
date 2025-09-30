import { Component, inject, input } from '@angular/core';
import { SaleOrderDto } from '../../../../shared/models/sale-order.dto';
import { IconService } from '../../../../shared/services/icon';
import { CURRENCY } from '../../../../core/config/currency.config';
import { CommonModule } from '@angular/common';
import { POS_Info } from '../../../../core/config/pos.config';

@Component({
  selector: 'app-payment-confirmed',
  imports: [CommonModule],
  templateUrl: './payment-confirmed.html',
  styleUrl: './payment-confirmed.css'
})
export class PaymentConfirmed {
  printTicket() {
  const printContents = document.getElementById('print-section')?.innerHTML;
  const printWindow = window.open('', '', 'height=600,width=400');
  
  if (printWindow && printContents) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket</title>
          <style>
            @page {
              size: 80mm;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 80mm;
              margin: 0;
              padding: 2px;
              font-size: 13px;
              background-color: white;
              color: black;
            }
            .bg-primary-light {
              background-color: #f3f4f6 !important;
            }
            .rounded-xl {
              border-radius: 0.75rem;
            }
            .p-5 {
              padding: 1.25rem;
            }
            .flex {
              display: flex;
            }
            .flex-col {
              flex-direction: column;
            }
            .items-center {
              align-items: center;
            }
            .w-full {
              width: 100%;
            }
            .max-w-\[80mm\] {
              max-width: 80mm;
            }
            .mx-auto {
              margin-left: auto;
              margin-right: auto;
            }
            .border {
              border: 1px solid #e5e7eb;
            }
            .shadow-lg {
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
            .text-center {
              text-align: center;
            }
            .text-xl {
              font-size: 1.25rem;
              line-height: 1.75rem;
            }
            .font-bold {
              font-weight: 700;
            }
            .mb-1 {
              margin-bottom: 0.25rem;
            }
            .tracking-wide {
              letter-spacing: 0.025em;
            }
            .text-xs {
              font-size: 0.75rem;
              line-height: 1rem;
            }
            .text-gray-400 {
              color: #9ca3af;
            }
            .my-2 {
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
            }
            .border-t {
              border-top-width: 1px;
            }
            .border-dashed {
              border-style: dashed;
              border-color: #888;
            }
            .justify-between {
              justify-content: space-between;
            }
            .text-lg {
              font-size: 1.125rem;
              line-height: 1.75rem;
            }
            .mt-2 {
              margin-top: 0.5rem;
            }
            .text-\[10px\] {
              font-size: 10px;
            }
            .font-mono {
              font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 80mm !important;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
  private readonly iconService = inject(IconService);
  saleOrder = input.required<SaleOrderDto>();
  posInfo = POS_Info

  currency = CURRENCY;

  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }
  ngOnInit(): void {
    console.log('SaleOrder en PaymentConfirmed:', this.saleOrder);
  }

}
