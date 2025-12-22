import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';
import { ProductCardDto } from "../dto/product-card";

export const CatalogMapper = {
  // 1. Lógica corregida para PRODUCTOS (Detalle)
  toDomainProduct(dto: any): Product {
    return {
      id: dto.id,
      name: dto.name ?? 'Producto sin nombre',
      description: dto.description ?? null,
      // ✅ FIX 1: Mapear el precio base del producto
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
          // ✅ FIX 2: ¡AQUÍ ESTÁ LA CLAVE! Mapear los atributos
          attributes: v.attributes ?? {},
          price: v.price, // Por si la variante trae precio propio en este DTO
          images: v.images ?? []
        }))
        : [],
    };
  },

  // 2. Restauramos CATEGORÍAS
  toDomainCategory(dto: CategoryDto): Category {
    return { ...dto };
  },

  // 3. Restauramos OFERTAS
  toDomainOffer(dto: OfferDto): Offer {
    return { ...dto };
  },

  // 4. Mapeo desde Cards (Listado)
  toDomainProductFromCard(dto: ProductCardDto): Product {
    // Intentamos mapear todas las imágenes si vienen en el DTO, si no, usamos la primaria
    let images: any[] = [];

    // SI TU DTO TIENE UN CAMPO 'images' (array), úsalo:
    if ((dto as any).images && Array.isArray((dto as any).images)) {
      images = (dto as any).images.map((img: any) => ({
        url: img.url,
        type: img.type
      }));
    }
    // Si no, fallback a la primaria
    else if (dto.primaryImageUrl) {
      images = [{ url: dto.primaryImageUrl, type: 'PRIMARY' }];
    }

    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? '',
      status: 'PUBLISHED',
      category: 'General',
      price: dto.minimumPrice,
      images: images, // <--- Pasamos el array completo
      variants: []
    };
  }
};
