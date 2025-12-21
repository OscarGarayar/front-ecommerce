export interface AdminProduct {
  id: number;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'DISCONTINUED' | string;
  category?: string | null;      // tu backend devuelve string "test"
  variants: AdminVariant[];
  images: AdminImage[];
}
import { AdminVariant } from './variant-admin';
import { AdminImage } from './image-admin';
