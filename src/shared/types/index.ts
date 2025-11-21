export type IdentificationType = 'cedula' | 'nit' | 'passport' | 'other';

export type NoteType = 'credit' | 'debit';

export type NoteReason =
  | 'product_return' // Devolución de producto
  | 'defective_product' // Producto defectuoso
  | 'price_adjustment' // Ajuste de precio
  | 'discount' // Descuento
  | 'service_not_provided' // Servicio no prestado
  | 'additional_charge' // Cargo adicional
  | 'missing_items' // Items faltantes en factura original
  | 'interest_charges' // Cargos por intereses
  | 'shipping_adjustment' // Ajuste de envío
  | 'other'; // Otro motivo

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Money {
  amount: number;
  currency: string;
}