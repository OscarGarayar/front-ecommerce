export interface CreateVariantRequestDto {
  sku?: string;
  name: string;       // nombre de variante, ej: "Default"
  price: number;      // obligatorio para storefront
  stock: number;      // o quantity, según backend
}
