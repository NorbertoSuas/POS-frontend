export const PAYMENT_METHODS = [
  { id: 'CASH', name: 'Efectivo', icon: 'banknote' },
  { id: 'CARD', name: 'Tarjeta', icon: 'credit-card' },
  { id: 'movil', name: 'Sinpe Movil', icon: 'smartphone' },
];
export const RECEIPT_TYPES = [
  { id: 'boletaSimple', name: 'Boleta Simple',description:'' },
  { id: 'boleta', name: 'Boleta ',description:'' },
  { id: 'factura', name: 'Factura',description:'' },
];
export const ORDER_STATUS = [
  { id: 'pendiente', name: 'Pendiente', description: 'La orden ha sido creada pero aún no procesada' },
  { id: 'en_preparacion', name: 'En preparación', description: 'La cocina o barra está preparando la orden' },
  { id: 'lista', name: 'Lista', description: 'La orden ya está lista para entregar' },
  { id: 'servida', name: 'Servida', description: 'La orden fue entregada al cliente/mesa' },
  { id: 'completada', name: 'Completada', description: 'La orden fue pagada y cerrada' },
  { id: 'cancelada', name: 'Cancelada', description: 'La orden fue anulada antes de completarse' },
  { id: 'reembolsada', name: 'Reembolsada', description: 'El pago fue devuelto al cliente' },
];