// src/app/features/order/pages/create-order.page.ts
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  DestroyRef,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductTypeService } from '../../../inventory/services/product-type.service';
import { OrderService } from '../../services/order.service';
import { BlurImageDirective } from '../../../../shared/directives/blur-image.directive';
import { ProductItem, SelectedProductItem } from '../../models/product-item';
import { IconService } from '../../../../shared/services/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderTypeService } from '../../services/order-type.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../shared/services/modal';
import { ExtrasSelect } from '../../components/extras-select/extras-select';
import { Payment } from '../../components/payment/payment';
import { createEmptyOrder, OrderDto } from '../../models/order-dto';
import { LoginService } from '../../../auth/services/login.service';
import { OrderSaleDto } from '../../models/order-sale-dto';
import { SaleOrderService } from '../../../payment/services/sale-order.service';
import { PaymentConfirmed } from '../../components/payment-confirmed/payment-confirmed';
import { CURRENCY } from '../../../../core/config/currency.config';
import { ProductExtra } from '../../models/product-extra';
import { ORDER_STATUS } from '../../../../core/config/catalog.config';

@Component({
  selector: 'page-create-order',
  standalone: true,
  imports: [
    CommonModule,
    BlurImageDirective,
    Modal,
    ExtrasSelect,
    Payment,
    PaymentConfirmed,
  ],
  templateUrl: './create-order-page.html',
  styleUrl: './create-order-page.css',
})
export class CreateOrderPage {
  modalService = inject(ModalService);
  private readonly loginService = inject(LoginService);
  private readonly saleOrderService = inject(SaleOrderService);
  private readonly iconService = inject(IconService);
  private readonly productTypeService = inject(ProductTypeService);
  private readonly orderService = inject(OrderService);
  private readonly orderTypeService = inject(OrderTypeService);
  private readonly destroyRef = inject(DestroyRef);

  // Reactive signals
  productTypes = this.productTypeService.productTypes;
  productItems = this.orderService.productItems;
  orderTypes = this.orderTypeService.orderTypes;

  listProductItemsSelected = signal<SelectedProductItem[]>([]);
  selectedCardProductItemId = signal<string | null>(null);
  selectedProductExtras = signal<ProductExtra[]>([]); // Selected extras IDs
  selectedOrderTypeId = signal<string | null>(null);
  selectedFilter = signal<string | 'all'>('all');
  editingQuantity = signal<string>('');
  newOrder = signal<OrderDto>(createEmptyOrder());
  currentProductWithExtras = signal<ProductItem | null>(null); // Current product for selecting extras

  // Constants
  currency = CURRENCY;

  readonly TAX_RATE = 0.18;
  readonly NUMPAD_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Computed properties
  filteredProductItems = computed(() => {
    const filter = this.selectedFilter();
    return filter === 'all'
      ? this.productItems()
      : this.productItems().filter((item) => item.productTypeId === filter);
  });
  // Quantity map by productId
  selectedProductQuantities = computed(() =>
    this.listProductItemsSelected().reduce((map, item) => {
      const q = Number(item.quantity) || 0;
      if (q > 0) {
        map.set(item.productId, (map.get(item.productId) ?? 0) + q);
      }
      return map;
    }, new Map<string, number>())
  );

  totalPrice = computed(() =>
    this.listProductItemsSelected().reduce(
      (total, item) => total + this.getProductTotalPrice(item),
      0
    )
  );

  totalTax = computed(() => this.totalPrice() * this.TAX_RATE);

  constructor() {
    // 1) llamadas de carga (una sola vez)
    this.productTypeService
      .loadProductTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.orderService
      .loadProductItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.orderTypeService
      .loadOrderTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // 2) efecto reactivo: cuando orderTypes() ya tenga datos, asigna el primer id
    effect(() => {
      const types = this.orderTypes();
      if (!types || types.length === 0) return; // no data yet

      const firstId = types[0].id;
      if (firstId && !this.selectedOrderTypeId()) {
        this.selectedOrderTypeId.set(firstId); // usa set() y no update()
      }
    });
  }
  /**
   * Calcula el precio total del producto incluyendo extras y cantidad.
   */
  getProductTotalPrice(productItem: SelectedProductItem): number {
    const extrasTotal =
      productItem.selectedExtras?.reduce(
        (sum, extra) => sum + (extra.price || 0),
        0
      ) || 0;
    return (productItem.price + extrasTotal) * productItem.quantity;
  }

  // Methods needed for template
  /**
   * Cambia el filtro de productos por tipo seleccionado.
   * @param value id del tipo de producto o 'all' para mostrar todos
   */
  setFilter(value: string | 'all') {
    this.selectedFilter.set(value);
  }

  /**
   * Selecciona un producto y abre el modal de extras si tiene disponibles.
   * Si el producto ya está en el carrito, incrementa la cantidad.
   * Si no, lo agrega con cantidad 1.
   */
  selectedProductItems(productItem: ProductItem) {
    if (productItem.availableExtras?.length) {
      this.currentProductWithExtras.set(productItem);
      this.openSelectedExtrasModal(productItem);
      // Don't add the product here, wait for extras confirmation
      return;
    }
    // Si no tiene extras, agrega directamente
    this.addProductToCart(productItem, []);
  }
  openSelectedExtrasModal(product: ProductItem) {
    this.modalService.open(
      'product-extras',
      product.productName,
      product.availableExtras
    );
  }
  saveProductExtras(extras: ProductExtra[]) {
    const product = this.currentProductWithExtras();
    if (!product) return;
    this.addProductToCart(product, extras);
    this.currentProductWithExtras.set(null);
    this.modalService.close();
  }

  addProductToCart(productItem: ProductItem, extras: ProductExtra[]) {
    this.listProductItemsSelected.update((items) => {
      const extrasIds = extras
        .map((e) => e.id)
        .sort((a, b) => a.localeCompare(b))
        .join(',');
      // search by productId + extrasKey (to see if identical combo already exists)
      const existingIndex = items.findIndex(
        (p) =>
          p.productId === productItem.productId &&
          (p.extrasKey || '') === extrasIds
      );

      if (existingIndex > -1) {
        // si existe el mismo combo, incrementa cantidad
        return items.map((p, i) =>
          i === existingIndex
            ? { ...p, quantity: p.quantity + 1, selectedExtras: extras }
            : p
        );
      }

      // if not exists, create new cart item with unique id
      const extrasKey = extrasIds;
      const cartItemId = this.generateCartItemId(
        productItem.productId,
        extrasKey
      );

      return [
        ...items,
        {
          ...productItem,
          cartItemId,
          extrasKey,
          quantity: 1,
          selectedExtras: extras,
          totalPrice: productItem.price, // optional if you recalculate dynamically
        },
      ];
    });
  }

  generateCartItemId(productId: string, extrasKey: string) {
    // puedes usar uuid si la tienes; esto evita deps
    return `${productId}::${
      extrasKey || 'noextras'
    }::${Date.now()}::${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Marca el producto como seleccionado en el carrito y resetea la edición de cantidad.
   */
  selectProductFromCart(item: SelectedProductItem) {
    this.selectedCardProductItemId.set(item.cartItemId ?? null);
    this.editingQuantity.set('');
  }

  // Numpad methods
  /**
   * Alterna el tipo de orden entre los disponibles (ej: mesa o para llevar).
   */
  toggleOrderType(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const types = this.orderTypes();

    if (types.length >= 2) {
      this.selectedOrderTypeId.set(checked ? types[0].id : types[1].id);
    }
  }
  /**
   * Permite ingresar la cantidad de productos usando el numpad virtual.
   * Actualiza la cantidad del producto seleccionado en el carrito.
   */
  pressNumpadKey(key: string) {
    const selectedCartItemId = this.selectedCardProductItemId();
    if (!selectedCartItemId) return;

    if (key === ',') return; // Ignorar coma decimal

    this.editingQuantity.update((text) => (text === '' ? key : text + key));
    const quantity = parseInt(this.editingQuantity(), 10) || 0;

    this.listProductItemsSelected.update((items) =>
      items.map((item) =>
        item.cartItemId === selectedCartItemId ? { ...item, quantity } : item
      )
    );
  }

  /**
   * Limpia todos los productos seleccionados del carrito tras confirmación.
   */
  pressAllClear() {
    if (confirm('¿Limpiar todos los productos seleccionados?')) {
      this.AllClear();
    }
  }
  /**
   * Resetea todos los estados del formulario de orden a sus valores iniciales.
   */
  AllClear() {
    this.listProductItemsSelected.set([]);
    this.selectedCardProductItemId.set(null);
    this.selectedFilter.set('all');
    this.editingQuantity.set('');
    this.newOrder.set(createEmptyOrder());
  }

  /**
   * Elimina o resetea la cantidad del producto seleccionado en el carrito.
   * Si la cantidad es mayor a 0, la pone en 0. Si ya está en 0, elimina el producto.
   */
  removeOrResetSelectedCartProduct() {
    const selectedCartItemId = this.selectedCardProductItemId();
    this.editingQuantity.set('');
    if (!selectedCartItemId) return;

    this.listProductItemsSelected.update((items) => {
      const index = items.findIndex((p) => p.cartItemId === selectedCartItemId);
      if (index === -1) return items;

      const product = items[index];

      if (product.quantity > 0) {
        return items.map((p, i) => (i === index ? { ...p, quantity: 0 } : p));
      } else {
        return items.filter((p) => p.cartItemId !== selectedCartItemId);
      }
    });
  }

  /**
   * Crea la orden con los productos seleccionados y los datos actuales.
   * Asocia el usuario logueado y los totales calculados.
   */
  createOrder() {
    const user = this.loginService.getCurrentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    this.newOrder.set({
      id: '0054', // se asigna en el backend
      listSelectedProductItems: this.listProductItemsSelected().map((item) => ({
        ...item,
        totalPrice: this.getProductTotalPrice(item), // 👈 calculate here
      })),
      orderType: this.orderTypes().find(
        (type) => type.id === this.selectedOrderTypeId()
      )!,
      //table: { id: 'some-table-id', number: 'Table 1', capacity: 4 },
      employee: user.employee,
      total: this.totalPrice(),
      tax: this.totalTax(), // 👈 you can also save it already calculated
      orderStatus: ORDER_STATUS.find(s => s.id === 'pendiente')!,
    });
  }

  /**
   * Abre el modal de pago y crea la orden antes de mostrarlo.
   */
  openPaymentModal() {
    this.createOrder();
    this.modalService.open('payment', 'Pagar', null);
  }
  /**
   * Guarda la orden de venta en el backend y muestra el modal de confirmación si es exitosa.
   * Limpia el carrito y estados tras guardar.
   */
  saveOrderSale(orderSale: OrderSaleDto) {
    this.saleOrderService.create(orderSale).subscribe((response) => {
      if (response?.success) {
        //alert('Orden de venta creada con éxito');
        // Here you can add additional logic, like clearing cart or redirecting
        this.modalService.close();
        this.openPaymentConfirmedModal(orderSale);
        this.AllClear();

        console.log('Respuesta del servidor:', orderSale);
      } else {
        alert(
          'Error al crear la orden de venta: ' +
            (response?.message || 'Desconocido')
        );
      }
    });
  }
  /**
   * Abre el modal de confirmación de pago con los datos de la orden de venta.
   */
  openPaymentConfirmedModal(orderSale: OrderSaleDto) {
    this.modalService.open('payment-confirmed', 'Pago Confirmado', orderSale);
  }

  // Helpers
  /**
   * Devuelve la ruta del icono SVG correspondiente al nombre dado.
   */
  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }
}
