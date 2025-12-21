import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../../core/config/app-config';
import { CatalogRepository } from '../../domain/ports/catalog-repository';
import { Product } from '../../domain/model/product';
import { Category } from '../../domain/model/category';
import { Offer } from '../../domain/model/offer';
import { ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../dto/category.dto';
import { OfferDto } from '../dto/offer.dto';
import { CatalogMapper } from '../mappers/catalog.mapper';

@Injectable({ providedIn: 'root' })
export class HttpCatalogRepository extends CatalogRepository {
  private readonly baseUrl = AppConfig.apiBaseUrl;

  constructor(private http: HttpClient) { super(); }
  getProductsPage(page: number, size: number) {
    const url = `${this.baseUrl}/api/v1/catalog/products/page?page=${page}&size=${size}&sortBy=id`;

    return this.http.get<any>(url).pipe(
      map((res) => (res?.content ?? []).map(CatalogMapper.toDomainProduct))
    );
  }




  getProductById(id: string | number): Observable<Product> {
    const url = `${this.baseUrl}/api/v1/catalog/products/${id}`;
    return this.http.get<ProductDto>(url).pipe(map(CatalogMapper.toDomainProduct));
  }

  getCategories(): Observable<Category[]> {
    const url = `${this.baseUrl}/api/v1/catalog/categories`;
    return this.http.get<CategoryDto[]>(url).pipe(map(list => list.map(CatalogMapper.toDomainCategory)));
  }

  getOffers(): Observable<Offer[]> {
    // Ajusta si tu backend tiene endpoint real de offers
    const url = `${this.baseUrl}/api/v1/catalog/offers`;
    return this.http.get<OfferDto[]>(url).pipe(map(list => list.map(CatalogMapper.toDomainOffer)));
  }
}
