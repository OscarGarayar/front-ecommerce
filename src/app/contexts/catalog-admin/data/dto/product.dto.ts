export interface ProductDto {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  category?: string | null;
  variants?: any[];
  images?: any[];
}
