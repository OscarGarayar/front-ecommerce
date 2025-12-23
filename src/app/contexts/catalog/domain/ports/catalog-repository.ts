import { Observable } from 'rxjs';
import { Product } from '../model/product';
import { Category } from '../model/category';
import { Offer } from '../model/offer';

export abstract class CatalogRepository {
  // Este es el método principal que actualizamos
  abstract getProductCards(page: number, size: number): Observable<Product[]>;

  abstract getProductById(id: string | number): Observable<Product>;

  abstract getCategories(): Observable<Category[]>;

  abstract getOffers(): Observable<Offer[]>;
}
