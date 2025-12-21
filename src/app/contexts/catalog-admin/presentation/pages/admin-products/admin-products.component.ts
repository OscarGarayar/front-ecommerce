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
    <div class="max-w-6xl mx-auto p-6 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Products</h1>
          <p class="text-sm text-gray-500 mt-1">
            DRAFT bucket: todo lo no publicado. PUBLISHED bucket: visible en storefront.
          </p>
        </div>

        <button class="border rounded px-3 py-2" (click)="load()">
          Refresh
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Crear producto -->
        <div class="border rounded-xl p-4 space-y-3">
          <h2 class="font-semibold">Crear producto</h2>

          <label class="block text-sm">Nombre</label>
          <input class="w-full border rounded p-2" [(ngModel)]="newName" name="newName" />

          <label class="block text-sm">Descripción (opcional)</label>
          <textarea class="w-full border rounded p-2" [(ngModel)]="newDesc" name="newDesc"></textarea>

          <label class="block text-sm">Categoría</label>
          <select class="w-full border rounded p-2" [(ngModel)]="newCategoryId" name="newCategoryId">
            <option [ngValue]="null">-- Selecciona --</option>
            <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
          </select>

          <button class="w-full border rounded px-3 py-2"
                  [disabled]="creating || !newName || !newCategoryId"
                  (click)="createProduct()">
            {{ creating ? 'Creando...' : 'Crear (queda en DRAFT)' }}
          </button>

          <p class="text-xs text-gray-500">
            Nota: se publica cuando tenga al menos 1 variante.
          </p>

          <p class="text-sm text-red-600 whitespace-pre-wrap" *ngIf="error">{{ error }}</p>
        </div>

        <!-- Listas -->
        <div class="md:col-span-2 space-y-6">
          <!-- DRAFT -->
          <div class="border rounded-xl p-4">
            <h2 class="font-semibold">DRAFT</h2>
            <p class="text-sm text-gray-500 mt-1">
              Importante: DRAFT no depende de si tiene variantes. Solo cambia a PUBLISHED manualmente.
            </p>

            <div class="mt-4 space-y-2" *ngIf="draft.length; else noDraft">
              <div class="border rounded p-3 flex items-center justify-between gap-4"
                   *ngFor="let p of draft">
                <div class="min-w-0">
                  <div class="font-medium truncate">
                    #{{p.id}} - {{ p.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Estado: {{ statusLabel(p) }} · Variantes: {{ (p.variants?.length || 0) }} · Cat: {{ p.category }}
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <a class="border rounded px-3 py-1"
                     [routerLink]="['/admin/products', p.id]">
                    Editar
                  </a>

                  <button class="border rounded px-3 py-1"
                          [disabled]="!canPublish(p) || busy[p.id]"
                          (click)="publish(p)">
                    Publish
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noDraft>
              <p class="text-sm text-gray-500 mt-4">No hay productos en DRAFT.</p>
            </ng-template>
          </div>

          <!-- PUBLISHED -->
          <div class="border rounded-xl p-4">
            <h2 class="font-semibold">PUBLISHED</h2>

            <div class="mt-4 space-y-2" *ngIf="published.length; else noPub">
              <div class="border rounded p-3 flex items-center justify-between gap-4"
                   *ngFor="let p of published">
                <div class="min-w-0">
                  <div class="font-medium truncate">
                    #{{p.id}} - {{ p.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Estado: {{ statusLabel(p) }} · Variantes: {{ (p.variants?.length || 0) }} · Cat: {{ p.category }}
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <a class="border rounded px-3 py-1"
                     [routerLink]="['/admin/products', p.id]">
                    Editar
                  </a>

                  <button class="border rounded px-3 py-1"
                          [disabled]="busy[p.id]"
                          (click)="unpublish(p)">
                    Unpublish
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noPub>
              <p class="text-sm text-gray-500 mt-4">No hay productos publicados.</p>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProductsComponent {
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
    // REGLA CORRECTA:
    // - DRAFT = status DRAFT (no depende de variantes)
    // - PUBLISHED = status PUBLISHED
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
    })
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
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

    // OJO: método correcto del repo
    this.repo.publishProduct(p.id)
      .pipe(finalize(() => (this.busy[p.id] = false)))
      .subscribe({
        next: () => this.load(),
        error: (e: unknown) => (this.error = this.prettyErr(e)),
      });
  }

  unpublish(p: ProductDto): void {
    this.busy[p.id] = true;
    this.error = '';

    // OJO: método correcto del repo
    this.repo.unpublishProduct(p.id)
      .pipe(finalize(() => (this.busy[p.id] = false)))
      .subscribe({
        next: () => this.load(),
        error: (e: unknown) => (this.error = this.prettyErr(e)),
      });
  }

  private prettyErr(err: unknown): string {
    const e: any = err;
    return e?.error?.message ?? e?.message ?? JSON.stringify(err);
  }
}
