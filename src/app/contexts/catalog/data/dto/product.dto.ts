export interface ProductDto {
  id: string | number;
  title: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  categoryId?: string | number;
}
