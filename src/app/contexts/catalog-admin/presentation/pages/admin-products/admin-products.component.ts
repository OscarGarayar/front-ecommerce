import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  HttpCatalogAdminRepository,
  ProductDto,
  CategoryDto
} from '../../../data/repositories/http-catalog-admin.repository';
import { ProductStatusUtils } from '../../../domain/model/product-status';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">

      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p class="mt-1 text-sm text-gray-500">Administra tus productos, variantes y estados de publicación.</p>
            </div>
            <button class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" (click)="load()">
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </span>
              Nuevo Producto
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" [(ngModel)]="newName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea rows="3" [(ngModel)]="newDesc" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Categoría</label>
                <select [(ngModel)]="newCategoryId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                  <option [ngValue]="null">-- Selecciona --</option>
                  <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <button
                (click)="createProduct()"
                [disabled]="creating || !newName || !newCategoryId"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
                {{ creating ? 'Creando...' : 'Crear Borrador' }}
              </button>

              <p *ngIf="error" class="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">{{ error }}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-3 space-y-8">

          <div class="bg-white shadow rounded-lg overflow-hidden border border-amber-100">
            <div class="px-6 py-4 border-b border-gray-200 bg-amber-50 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-amber-900">Borradores (Draft)</h3>
                <p class="mt-1 text-sm text-amber-700">Productos en edición, no visibles en la tienda.</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                {{ draft.length }} items
              </span>
            </div>

            <div *ngIf="draft.length === 0" class="p-8 text-center text-gray-500 italic">
              No tienes borradores pendientes.
            </div>

            <ul class="divide-y divide-gray-200" *ngIf="draft.length > 0">
              <li *ngFor="let p of draft" class="hover:bg-gray-50 transition-colors">
                <div class="px-6 py-4 flex items-center justify-between">
                  <div class="flex items-center min-w-0">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-indigo-600 truncate mr-2">
                        {{ p.name }}
                        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {{ p.category }}
                        </span>
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ p.variants?.length || 0 }} variantes configuradas
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <button
                      (click)="publish(p)"
                      [disabled]="!canPublish(p) || busy[p.id]"
                      [title]="!canPublish(p) ? 'Necesita al menos 1 variante' : 'Publicar'"
                      class="text-sm text-gray-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium">
                      Publicar
                    </button>
                    <a [routerLink]="['/admin/catalog/products', p.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center">
                      Editar <span aria-hidden="true" class="ml-1">→</span>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="bg-white shadow rounded-lg overflow-hidden border border-green-100">
            <div class="px-6 py-4 border-b border-gray-200 bg-green-50 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-green-900">Publicados</h3>
                <p class="mt-1 text-sm text-green-700">Productos activos y visibles para los clientes.</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                {{ published.length }} items
              </span>
            </div>

            <div *ngIf="published.length === 0" class="p-8 text-center text-gray-500 italic">
              No hay productos publicados aún.
            </div>

            <ul class="divide-y divide-gray-200" *ngIf="published.length > 0">
              <li *ngFor="let p of published" class="hover:bg-gray-50 transition-colors">
                <div class="px-6 py-4 flex items-center justify-between">
                  <div class="flex items-center min-w-0">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ p.name }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                        Activo en tienda
                        <span class="text-gray-300">|</span>
                        Cat: {{ p.category }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <button
                      (click)="unpublish(p)"
                      [disabled]="busy[p.id]"
                      class="text-sm text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50">
                      Despublicar
                    </button>
                    <a [routerLink]="['/admin/catalog/products', p.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                      Gestionar
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AdminProductsComponent {
  // LOGICA INTACTA (Copiada de tu archivo original)
  categories: CategoryDto[] = [];
  products: ProductDto[] = [];
  draft: ProductDto[] = [];
  published: ProductDto[] = [];
  newName = '';
  newDesc = '';
  newCategoryId: number | null = null;
  creating = false;
  busy: Record<number, boolean> = {};
  error = '';

  constructor(private repo: HttpCatalogAdminRepository) {
    this.load();
  }

  load(): void {
    this.error = '';
    this.repo.getCategories().subscribe({
      next: (cats: CategoryDto[]) => (this.categories = cats),
      error: (e: unknown) => (this.error = this.prettyErr(e)),
    });
    this.repo.getProductsPage(0, 200, 'id').subscribe({
      next: (res: any) => {
        this.products = res.content ?? [];
        this.rebucket();
      },
      error: (e: unknown) => (this.error = this.prettyErr(e)),
    });
  }

  private rebucket(): void {
    this.draft = this.products.filter(p => ProductStatusUtils.isDraftBucket(p.status));
    this.published = this.products.filter(p => ProductStatusUtils.isPublished(p.status));
  }

  statusLabel(p: ProductDto): 'DRAFT' | 'PUBLISHED' {
    return ProductStatusUtils.display(p.status);
  }

  canPublish(p: ProductDto): boolean {
    return (p.variants?.length ?? 0) >= 1;
  }

  createProduct(): void {
    if (!this.newName || !this.newCategoryId) return;
    this.creating = true;
    this.error = '';
    this.repo.createProduct({
      name: this.newName,
      description: this.newDesc ? this.newDesc : null,
      categoryId: this.newCategoryId,
    }).pipe(finalize(() => (this.creating = false))).subscribe({
      next: () => {
        this.newName = '';
        this.newDesc = '';
        this.newCategoryId = null;
        this.load();
      },
      error: (e: unknown) => (this.error = this.prettyErr(e)),
    });
  }

  publish(p: ProductDto): void {
    this.busy[p.id] = true;
    this.error = '';
    this.repo.publishProduct(p.id).pipe(finalize(() => (this.busy[p.id] = false))).subscribe({
      next: () => this.load(),
      error: (e: unknown) => (this.error = this.prettyErr(e)),
    });
  }

  unpublish(p: ProductDto): void {
    this.busy[p.id] = true;
    this.error = '';
    this.repo.unpublishProduct(p.id).pipe(finalize(() => (this.busy[p.id] = false))).subscribe({
      next: () => this.load(),
      error: (e: unknown) => (this.error = this.prettyErr(e)),
    });
  }

  private prettyErr(err: unknown): string {
    const e: any = err;
    return e?.error?.message ?? e?.message ?? JSON.stringify(err);
  }
}
