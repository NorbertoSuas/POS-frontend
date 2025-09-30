import {
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IconService } from '../../../../shared/services/icon';
import { Employee } from '../../../user/models/employee';
import { OrderDto } from '../../models/order-dto';
import { LoginService } from '../../../auth/services/login.service';
import { OrderSaleService } from '../../services/order-sale.service';
import {
  PAYMENT_METHODS,
  RECEIPT_TYPES,
} from '../../../../core/config/catalog.config';
import { CURRENCY } from '../../../../core/config/currency.config';
import { SaleOrderDto } from '../../../../shared/models/sale-order.dto';

@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  private readonly iconService = inject(IconService);
  private readonly loginService = inject(LoginService);
  private readonly orderSaleService = inject(OrderSaleService);

  order = input.required<OrderDto>();
  newSaleOrder = output<SaleOrderDto>();

  paymentMethods = PAYMENT_METHODS;
  receiptTypes = RECEIPT_TYPES;
  currency = CURRENCY;

  receiptTypeSelected = signal<string>(this.receiptTypes[0].name);
  paymentMethodSelected = signal<string>(this.paymentMethods[0].name);
  employee = signal<Employee>({} as Employee);
  pos = signal<string>('restaurante');
  saleCondition = signal<string>('');
  discount = signal<number>(0);
  creditTerm = signal<number>(0);
  saleChannel = signal<string>('');
  customer = signal<string>('Varios');
  

  selectPaymentMethod(method: string): void {
    this.paymentMethodSelected.set(method);
  }
  selectReceiptType(receipt: string): void {
    this.paymentMethodSelected.set(receipt);
  }

  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }
  get integerPart(): string {
    return Math.floor(this.order().total).toString();
  }

  get decimalPart(): string {
    return this.order().total.toFixed(2).split('.')[1]; // "15"
  }

  paymentConfirm() {
    const employeeLogued = this.loginService.getCurrentUser();
    if (employeeLogued) {
      this.employee.set(employeeLogued.employee);
    }
    const orderToSave: SaleOrderDto = {
      order: this.order(),
      employee: this.employee(),
      paymentMethod: this.paymentMethodSelected(),
      receiptType: this.receiptTypeSelected(),
      totalAmount: this.order().total,
      discount: this.discount(),
      tax: this.order().tax,
      pos: this.pos(),
      saleCondition: this.saleCondition(),
      creditTerm: this.creditTerm(),
      saleChannel: this.saleChannel(),
      customer: this.customer(),
      createdAt: new Date(),
    };
    this.newSaleOrder.emit(orderToSave);
  }
}
