import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';

export const CatalogMapper = {
  toDomainProduct(dto: any): Product {
    return {
      id: dto.id,
      name: dto.name ?? '',
      description: dto.description ?? null,
      status: dto.status ?? null,
      category: dto.category ?? null,
      images: dto.images ?? [],
      variants: dto.variants ?? [],
    };
  },
  toDomainCategory(dto: CategoryDto): Category { return { ...dto }; },
  toDomainOffer(dto: OfferDto): Offer { return { ...dto }; },
};
