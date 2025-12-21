export interface AdminVariant {
  id: number;
  sku?: string | null;
  attributes?: Record<string, string>;
  status?: string | null;
  images: AdminImage[];
  // price no siempre viene en response, depende del GET product real
  price?: number | null;
}
import { AdminImage } from './image-admin';
