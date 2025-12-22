export interface ProductCardDto {
  id: number;
  name: string;
  description?: string;
  primaryImageUrl?: string;
  minimumPrice?: number;
  lowStock?: boolean;
  // Nota: Swagger no muestra 'category' en este endpoint, ojo con el filtro
}
