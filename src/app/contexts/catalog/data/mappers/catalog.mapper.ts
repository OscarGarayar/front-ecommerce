import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';
import { ProductCardDto } from "../dto/product-card";
import { PageDto } from '../dto/page.dto'; // <--- Importamos el nuevo DTO

export const CatalogMapper = {
  // 1. Mapeo de PRODUCTO COMPLETO (Usado para Detalle y ahora también para la Lista)
  toDomainProduct(dto: any): Product {
    return {
      id: dto.id,
      name: dto.name ?? 'Producto sin nombre',
      description: dto.description ?? null,
      // Si el back no envía precio en este endpoint, se asume 0
      price: dto.price ?? 0,
      status: dto.status ?? 'DRAFT',
      category: dto.category ?? 'General',

      // Mapeo seguro de imágenes
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
          attributes: v.attributes ?? {},
          price: v.price,
          images: v.images ?? []
        }))
        : [],
    };
  },

  // 2. NUEVO: Mapeo de PÁGINA COMPLETA
  toDomainPage(pageDto: PageDto<any>): Product[] {
    if (!pageDto || !Array.isArray(pageDto.content)) {
      return [];
    }
    // Reutilizamos toDomainProduct porque la lista ahora trae toda la info
    return pageDto.content.map(item => CatalogMapper.toDomainProduct(item));
  },

  // ... (El resto de métodos como toDomainCategory, toDomainOffer se mantienen igual)
  toDomainCategory(dto: CategoryDto): Category {
    return { ...dto };
  },

  toDomainOffer(dto: OfferDto): Offer {
    return { ...dto };
  },

  // (Opcional) Puedes mantener toDomainProductFromCard si algún otro endpoint viejo lo usa,
  // pero el nuevo endpoint usa toDomainProduct.
};
