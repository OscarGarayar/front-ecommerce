import { ProductDto } from '../dto/product.dto';
import { AdminProduct } from '../../domain/model/product-admin';

export const CatalogAdminMapper = {
  toDomainProduct(dto: ProductDto): AdminProduct {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? null,
      status: dto.status,
      category: dto.category ?? null,
      variants: (dto.variants ?? []).map((v: any) => ({
        id: v.id,
        sku: v.sku ?? null,
        attributes: v.attributes ?? {},
        status: v.status ?? null,
        images: v.images ?? [],
        price: v.price ?? null, // si el GET lo incluye
      })),
      images: (dto.images ?? []).map((img: any) => ({
        id: img.id,
        url: img.url,
        type: img.type ?? null,
        position: img.position ?? null,
        primary: img.primary ?? null,
      })),
    };
  },
};
