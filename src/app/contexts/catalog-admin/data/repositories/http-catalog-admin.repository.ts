import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { AppConfig } from '../../../../core/config/app-config';
import { CategoryDto } from '../dto/category.dto';
import { PageDto } from '../dto/page.dto';
import { ProductDto } from '../dto/product.dto';
import { CatalogAdminMapper } from '../mappers/catalog-admin.mapper';
import { ImageType } from '../../domain/model/image-type';

export interface ImagePayload {
  url: string;
  type: ImageType;      // OBLIGATORIO (enum backend)
  position?: number;    // opcional
}

@Injectable({ providedIn: 'root' })
export class HttpCatalogAdminRepository {
  private readonly baseUrl = AppConfig.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ===== Categories =====
  getCategories() {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/api/v1/catalog/categories`);
  }

  createCategory(payload: { name: string; description?: string; parentId?: number | null }) {
    return this.http.post<any>(`${this.baseUrl}/api/v1/catalog/categories`, payload);
  }

  // ===== Products =====
  getProductsPage(page: number, size: number, sortBy: string = 'id') {
    const url = `${this.baseUrl}/api/v1/catalog/products/page?page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<PageDto<ProductDto>>(url).pipe(
      map((res) => ({
        ...res,
        content: (res.content ?? []).map(CatalogAdminMapper.toDomainProduct),
      }))
    );
  }

  getProductById(id: number) {
    return this.http.get<ProductDto>(`${this.baseUrl}/api/v1/catalog/products/${id}`).pipe(
      map(CatalogAdminMapper.toDomainProduct)
    );
  }

  createProduct(payload: { name: string; description?: string | null; categoryId: number }) {
    return this.http.post<any>(`${this.baseUrl}/api/v1/catalog/products`, payload);
  }

  // ===== Variants =====
  createVariant(productId: number, payload: { sku?: string; attributes: Record<string, string>; price: number }) {
    return this.http.post<any>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/variants`,
      payload
    );
  }

  deleteVariant(productId: number, variantId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/variants/${variantId}`
    );
  }

  // ===== Product Images =====
  addProductImage(productId: number, payload: ImagePayload) {
    return this.http.post<any>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/images`,
      payload
    );
  }

  deleteProductImage(productId: number, imageId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/images/${imageId}`
    );
  }

  setProductPrimaryImage(productId: number, imageId: number) {
    return this.http.patch<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/images/${imageId}/primary`,
      {}
    );
  }

  // ===== Variant Images =====
  addVariantImage(productId: number, variantId: number, payload: ImagePayload) {
    return this.http.post<any>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/variants/${variantId}/images`,
      payload
    );
  }

  deleteVariantImage(productId: number, variantId: number, imageId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/variants/${variantId}/images/${imageId}`
    );
  }

  // ===== Product Status =====
  publishProduct(productId: number) {
    return this.http.patch<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/publish`,
      {}
    );
  }

  unpublishProduct(productId: number) {
    return this.http.patch<void>(
      `${this.baseUrl}/api/v1/catalog/products/${productId}/unpublish`,
      {}
    );
  }
}

// Export para imports convenientes
export type { CategoryDto, PageDto, ProductDto };
