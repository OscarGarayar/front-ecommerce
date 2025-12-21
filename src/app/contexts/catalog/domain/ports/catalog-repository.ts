import { Product } from '../model/product';
import { Category } from '../model/category';
import { Offer } from '../model/offer';

export abstract class CatalogRepository {
  abstract getProductsPage(page: number, size: number): import('rxjs').Observable<Product[]>;
  abstract getProductById(id: string | number): import('rxjs').Observable<Product>;
  abstract getCategories(): import('rxjs').Observable<Category[]>;
  abstract getOffers(): import('rxjs').Observable<Offer[]>;
}
