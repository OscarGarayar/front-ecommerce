import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';

export const CatalogMapper = {
  // 1. Lógica corregida para PRODUCTOS (la que arreglamos para el Swagger)
  toDomainProduct(dto: any): Product {
    return {
      id: dto.id,
      name: dto.name ?? 'Producto sin nombre',
      description: dto.description ?? null,
      status: dto.status ?? 'DRAFT',
      category: dto.category ?? 'General',

      // Mapeo seguro de imágenes (extrae URL real)
      images: Array.isArray(dto.images)
        ? dto.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          type: img.type
        }))
        : [],

      // Mapeo de variantes
      variants: Array.isArray(dto.variants)
        ? dto.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          status: v.status,
          images: v.images ?? []
        }))
        : [],
    };
  },

  // 2. Restauramos CATEGORÍAS (necesario para que compile)
  toDomainCategory(dto: CategoryDto): Category {
    return { ...dto };
  },

  // 3. Restauramos OFERTAS (necesario para que compile)
  toDomainOffer(dto: OfferDto): Offer {
    return { ...dto };
  },
};
