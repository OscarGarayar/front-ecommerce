export interface ProductImage {
  id: number;
  url: string;
  type?: 'PRIMARY' | string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  status: string;
  images?: ProductImage[];
  // Nota: El backend NO está enviando precio en la variante según las fotos
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
  category?: string; // Swagger muestra que llega como string ("test")
  images: ProductImage[];
  variants: ProductVariant[];
}
