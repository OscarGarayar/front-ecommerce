export interface Product {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  category?: string;
  price?: number; // <--- Nuevo campo para el precio base
  images: ProductImage[];
  variants: ProductVariant[];
}

// Interfaces auxiliares (se mantienen igual o se ajustan)
export interface ProductImage {
  id?: number;
  url: string;
  type?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  status: string;
  attributes?: Record<string, string>; // Para guardar { "Talla": "M", "Color": "Rojo" }
  images?: ProductImage[];
}
