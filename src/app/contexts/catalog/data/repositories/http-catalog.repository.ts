import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../../core/config/app-config';
import { CatalogRepository } from '../../domain/ports/catalog-repository'; // Asegúrate de importar esto
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';
import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { CatalogMapper } from '../mappers/catalog.mapper';
import { PageDto } from '../dto/page.dto';

@Injectable({ providedIn: 'root' })
export class HttpCatalogRepository extends CatalogRepository {
  private readonly baseUrl = AppConfig.apiBaseUrl;

  constructor(private http: HttpClient) { super(); }

  // 1. Implementación de getProductCards (Coincide con el abstracto)
  override getProductCards(page: number, size: number): Observable<Product[]> {
    const url = `${this.baseUrl}/api/v1/catalog/products/published/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'id');

    return this.http.get<PageDto<any>>(url, { params }).pipe(
      map(pageDto => CatalogMapper.toDomainPage(pageDto))
    );
  }

  // 2. Implementación de getProductById
  override getProductById(id: string | number): Observable<Product> {
    const url = `${this.baseUrl}/api/v1/catalog/products/${id}`;
    return this.http.get<ProductDto>(url).pipe(
      map(dto => CatalogMapper.toDomainProduct(dto))
    );
  }

  // 3. Implementación de getCategories
  override getCategories(): Observable<Category[]> {
    const url = `${this.baseUrl}/api/v1/catalog/categories`;
    return this.http.get<CategoryDto[]>(url).pipe(
      map(list => list.map(CatalogMapper.toDomainCategory))
    );
  }

  // 4. Implementación de getOffers
  override getOffers(): Observable<Offer[]> {
    const url = `${this.baseUrl}/api/v1/catalog/offers`;
    return this.http.get<OfferDto[]>(url).pipe(
      map(list => list.map(CatalogMapper.toDomainOffer))
    );
  }
}
