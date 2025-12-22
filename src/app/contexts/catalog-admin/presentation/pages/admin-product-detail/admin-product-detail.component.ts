import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpCatalogAdminRepository } from '../../../data/repositories/http-catalog-admin.repository';

// IMPORTS
import { AdminProductInfoComponent } from './admin-product-info.component';
import { AdminProductMediaComponent } from './admin-product-media.component';
import { AdminProductVariantsComponent } from './admin-product-variants.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIf,
    AdminProductInfoComponent,
    AdminProductMediaComponent,
    AdminProductVariantsComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20 font-sans" *ngIf="product; else loadingTpl">

      <div class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/admin/catalog/products" class="text-gray-400 hover:text-gray-600">← Volver</a>
            <div>
              <h1 class="text-xl font-bold text-gray-900 leading-none">{{ product.name }}</h1>
              <span class="text-xs text-gray-500">ID: {{ product.id }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="refresh()" class="p-2 text-gray-400 hover:text-indigo-600" title="Recargar">↻</button>

            <button *ngIf="product.status !== 'PUBLISHED'" (click)="publish()" [disabled]="busy"
                    class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700">
              Publicar
            </button>
            <button *ngIf="product.status === 'PUBLISHED'" (click)="unpublish()" [disabled]="busy"
                    class="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600">
              Pasar a Borrador
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-8">
          <app-admin-product-variants
            [variants]="product.variants"
            [productId]="product.id"
            [productStatus]="product.status"
            (onCreate)="createVariant($event)"
            (onDelete)="deleteVariant($event)"
            (onRefresh)="refresh()">
          </app-admin-product-variants>
        </div>

        <div class="lg:col-span-1 space-y-6">

          <app-admin-product-media
            [images]="product.images"
            (onUpload)="addImage($event)"
            (onDelete)="deleteImage($event)"
            (onSetPrimary)="setPrimary($event)">
          </app-admin-product-media>

          <app-admin-product-info
            [category]="product.category"
            [description]="product.description"
            [status]="product.status">
          </app-admin-product-info>

          <div *ngIf="message" class="p-3 bg-green-100 text-green-700 rounded text-sm border border-green-200 shadow-sm animate-pulse">
            {{ message }}
          </div>
          <div *ngIf="error" class="p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 shadow-sm whitespace-pre-wrap">
            {{ error }}
          </div>
        </div>

      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="flex justify-center items-center h-64 text-gray-400">
        <span class="text-lg">Cargando producto...</span>
      </div>
    </ng-template>
  `
})
export class AdminProductDetailComponent {
  product: any = null;
  busy = false;
  message = '';
  error = '';
  private productId: number;

  constructor(private repo: HttpCatalogAdminRepository, route: ActivatedRoute) {
    this.productId = Number(route.snapshot.paramMap.get('id'));
    this.refresh();
  }

  refresh() {
    this.busy = true;
    this.repo.getProductById(this.productId).pipe(finalize(() => this.busy = false)).subscribe({
      next: (res) => this.product = res,
      error: (e) => this.error = this.prettyErr(e)
    });
  }

  publish() {
    this.repo.publishProduct(this.productId).subscribe({
      next: () => { this.message = 'Producto Publicado Exitosamente'; this.refresh(); },
      error: (e) => this.error = this.prettyErr(e)
    });
  }
  unpublish() {
    this.repo.unpublishProduct(this.productId).subscribe({
      next: () => { this.message = 'Producto devuelto a Borrador'; this.refresh(); },
      error: (e) => this.error = this.prettyErr(e)
    });
  }

  addImage(url: string) {
    this.repo.addProductImage(this.productId, { url, type: 'GALLERY' }).subscribe(() => this.refresh());
  }
  deleteImage(id: number) {
    this.repo.deleteProductImage(this.productId, id).subscribe(() => this.refresh());
  }
  setPrimary(id: number) {
    this.repo.setProductPrimaryImage(this.productId, id).subscribe(() => this.refresh());
  }

  createVariant(data: any) {
    this.repo.createVariant(this.productId, data).subscribe({
      next: () => { this.message = 'Variante creada'; this.refresh(); },
      error: (e) => this.error = this.prettyErr(e)
    });
  }
  deleteVariant(id: number) {
    this.repo.deleteVariant(this.productId, id).subscribe(() => this.refresh());
  }

  private prettyErr(e: any) { return e?.error?.message ?? e.message; }
}
