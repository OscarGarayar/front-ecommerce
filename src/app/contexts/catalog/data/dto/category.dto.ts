export interface CategoryDto {
  id: string | number;
  name: string;
  slug?: string;
  isActive?: boolean;
  parentId?: string | number;
}
