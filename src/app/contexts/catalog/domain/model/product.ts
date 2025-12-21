export interface Product {
  id: number;
  name: string;
  description?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'DISCONTINUED' | string;
  category?: string | null;
  images?: unknown[];
  variants?: unknown[];
}
