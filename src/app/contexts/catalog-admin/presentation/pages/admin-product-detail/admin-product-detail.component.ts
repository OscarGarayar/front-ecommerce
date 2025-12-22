import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { HttpCatalogAdminRepository } from '../../../data/repositories/http-catalog-admin.repository';
import { IMAGE_TYPES, ImageType } from '../../../domain/model/image-type';

type VariantVm = {
  id: number;
  sku: string;
  attributes: Record<string, any>;
  status?: string;
  images: any[];
};

type ProductVm = {
  id: number;
  name: string;
  description?: string | null;
  status: string; // DRAFT / PUBLISHED (para tu caso)
  category: string;
  variants: VariantVm[];
  images: any[];
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIf, NgFor],
  template: `
    <div class="max-w-5xl mx-auto p-6 space-y-6" *ngIf="product as p; else loadingTpl">
      <!-- Base info + acciones -->
      <div class="border rounded-xl p-4 space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold">Base info</h1>
            <div class="text-sm text-gray-700 mt-1">Name: {{ p.name }}</div>
            <div class="text-sm text-gray-700">Category: {{ p.category }}</div>
            <div class="text-sm text-gray-700">Status: {{ p.status }}</div>
          </div>

          <div class="flex gap-2">
            <button class="border rounded px-3 py-2" (click)="refresh()" [disabled]="busy">
              Refresh
            </button>

            <button class="border rounded px-3 py-2"
                    (click)="publish()"
                    [disabled]="busy || !canPublish(p)">
              Publish
            </button>

            <button class="border rounded px-3 py-2"
                    (click)="unpublish()"
                    [disabled]="busy">
              Unpublish
            </button>
          </div>
        </div>

        <p class="text-sm text-red-600 whitespace-pre-wrap" *ngIf="error">{{ error }}</p>
        <p class="text-sm text-green-700 whitespace-pre-wrap" *ngIf="message">{{ message }}</p>
      </div>

      <!-- Product Images -->
      <div class="border rounded-xl p-4 space-y-3">
        <h2 class="font-semibold">Product Images</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm">URL</label>
            <input class="w-full border rounded p-2" [(ngModel)]="prodImageUrl" name="prodImageUrl" />
          </div>

          <div>
            <label class="block text-sm">Type</label>
            <select class="w-full border rounded p-2"
                    [(ngModel)]="prodImageType"
                    name="prodImageType">
              <option *ngFor="let t of imageTypes" [ngValue]="t.value">{{ t.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm">Position (opcional)</label>
            <input class="w-full border rounded p-2" type="number"
                   [(ngModel)]="prodImagePosition" name="prodImagePosition" />
          </div>
        </div>

        <button class="border rounded px-3 py-2"
                (click)="addProductImage()"
                [disabled]="busy || !prodImageUrl.trim()">
          Add product image
        </button>

        <div class="mt-3 space-y-2" *ngIf="(p.images?.length ?? 0) > 0; else noProdImages">
          <div class="border rounded p-3 flex items-center justify-between gap-4"
               *ngFor="let img of p.images">
            <div class="min-w-0">
              <div class="font-medium">#{{ img.id }} · {{ img.type }}</div>
              <div class="text-xs text-gray-600 break-all">{{ img.url }}</div>
            </div>

            <div class="flex gap-2 shrink-0">
              <button class="border rounded px-3 py-1"
                      (click)="setPrimary(img.id)"
                      [disabled]="busy">
                Set primary
              </button>

              <button class="border rounded px-3 py-1"
                      (click)="deleteProductImage(img.id)"
                      [disabled]="busy">
                Delete
              </button>
            </div>
          </div>
        </div>

        <ng-template #noProdImages>
          <div class="text-sm text-gray-500">No product images.</div>
        </ng-template>
      </div>

      <!-- Variants -->
      <div class="border rounded-xl p-4 space-y-4">
        <h2 class="font-semibold">Variants</h2>

        <!-- Crear variante -->
        <div class="border rounded p-4 space-y-3">
          <h3 class="font-medium">Add variant</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm">SKU</label>
              <input class="w-full border rounded p-2" [(ngModel)]="newVariantSku" name="newVariantSku" />
            </div>

            <div>
              <label class="block text-sm">Attr key</label>
              <input class="w-full border rounded p-2" [(ngModel)]="newVariantAttrKey" name="newVariantAttrKey" />
            </div>

            <div>
              <label class="block text-sm">Attr value</label>
              <input class="w-full border rounded p-2" [(ngModel)]="newVariantAttrValue" name="newVariantAttrValue" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm">Price</label>
              <input class="w-full border rounded p-2" type="number"
                     [(ngModel)]="newVariantPrice" name="newVariantPrice" />
            </div>
          </div>

          <button class="border rounded px-3 py-2"
                  (click)="addVariant()"
                  [disabled]="busy || !newVariantSku.trim() || !newVariantAttrKey.trim()">
            Create variant
          </button>
        </div>

        <!-- Lista variantes -->
        <div class="space-y-4" *ngIf="(p.variants?.length ?? 0) > 0; else noVariants">
          <div class="border rounded p-4 space-y-3" *ngFor="let v of p.variants">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="font-medium">Variant #{{ v.id }} · SKU: {{ v.sku }}</div>
                <div class="text-xs text-gray-600">attrs: {{ v.attributes | json }}</div>
              </div>

              <button class="border rounded px-3 py-1"
                      (click)="deleteVariant(v.id)"
                      [disabled]="busy">
                Delete variant
              </button>
            </div>

            <!-- Agregar imagen a variante -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-sm">URL</label>
                <input class="w-full border rounded p-2"
                       [(ngModel)]="variantImageUrlByVariantId[v.id]"
                       [name]="'variantImageUrl_'+v.id" />
              </div>

              <div>
                <label class="block text-sm">Type</label>
                <select class="w-full border rounded p-2"
                        [(ngModel)]="variantImageTypeByVariantId[v.id]"
                        [name]="'variantImageType_'+v.id">
                  <option *ngFor="let t of imageTypes" [ngValue]="t.value">{{ t.label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm">Position (opcional)</label>
                <input class="w-full border rounded p-2" type="number"
                       [(ngModel)]="variantImagePositionByVariantId[v.id]"
                       [name]="'variantImagePos_'+v.id" />
              </div>
            </div>

            <button class="border rounded px-3 py-2"
                    (click)="addVariantImage(v.id)"
                    [disabled]="busy || !(variantImageUrlByVariantId[v.id] || '').trim()">
              Add variant image
            </button>

            <div class="text-sm text-gray-600" *ngIf="(v.images?.length ?? 0) === 0">
              No variant images.
            </div>
          </div>
        </div>

        <ng-template #noVariants>
          <div class="text-sm text-gray-500">No variants yet.</div>
        </ng-template>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="max-w-5xl mx-auto p-6">
        <div class="border rounded-xl p-6">Loading...</div>
      </div>
    </ng-template>
  `
})
export class AdminProductDetailComponent {
  imageTypes = IMAGE_TYPES;

  product: ProductVm | null = null;

  busy = false;
  error = '';
  message = '';

  // Product images form
  prodImageUrl = '';
  prodImageType: ImageType = 'GALLERY';
  prodImagePosition: number | null = null;

  // Variant create form
  newVariantSku = '';
  newVariantAttrKey = 'additionalProp1';
  newVariantAttrValue = 'test';
  newVariantPrice = 0;

  // Variant images form (por variante)
  variantImageUrlByVariantId: Record<number, string> = {};
  variantImageTypeByVariantId: Record<number, ImageType> = {};
  variantImagePositionByVariantId: Record<number, number | null> = {};

  private readonly productId: number;

  constructor(
    private repo: HttpCatalogAdminRepository,
    route: ActivatedRoute
  ) {
    this.productId = Number(route.snapshot.paramMap.get('id'));
    this.refresh();
  }

  refresh() {
    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.getProductById(this.productId)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: (p: any) => {
          this.product = {
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            status: p.status,
            category: p.category,
            variants: (p.variants ?? []).map((v: any) => ({
              id: v.id,
              sku: v.sku,
              attributes: v.attributes ?? {},
              status: v.status,
              images: v.images ?? [],
            })),
            images: p.images ?? [],
          };

          // Defaults por variante
          for (const v of this.product.variants ?? []) {
            if (!this.variantImageTypeByVariantId[v.id]) {
              this.variantImageTypeByVariantId[v.id] = 'GALLERY';
            }
            if (this.variantImageUrlByVariantId[v.id] === undefined) {
              this.variantImageUrlByVariantId[v.id] = '';
            }
            if (this.variantImagePositionByVariantId[v.id] === undefined) {
              this.variantImagePositionByVariantId[v.id] = null;
            }
          }
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  canPublish(p: ProductVm): boolean {
    // condición mínima (backend): al menos 1 variante
    return (p.variants?.length ?? 0) >= 1;
  }

  publish() {
    if (!this.product) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.publishProduct(this.product.id)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.message = 'Publicado.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  unpublish() {
    if (!this.product) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.unpublishProduct(this.product.id)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.message = 'Pasó a DRAFT.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  // ===== Product Images =====
  addProductImage() {
    if (!this.product) return;

    const url = this.prodImageUrl.trim();
    if (!url) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.addProductImage(this.product.id, {
      url,
      type: this.prodImageType,                      // OBLIGATORIO
      position: this.prodImagePosition ?? undefined, // opcional
    })
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.prodImageUrl = '';
          this.prodImagePosition = null;
          this.message = 'Imagen de producto agregada.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  deleteProductImage(imageId: number) {
    if (!this.product) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.deleteProductImage(this.product.id, imageId)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.message = 'Imagen eliminada.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  setPrimary(imageId: number) {
    if (!this.product) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.setProductPrimaryImage(this.product.id, imageId)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.message = 'Imagen marcada como PRIMARY.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  // ===== Variants =====
  addVariant() {
    if (!this.product) return;

    const sku = this.newVariantSku.trim();
    const key = this.newVariantAttrKey.trim();
    const value = this.newVariantAttrValue.trim();

    if (!sku || !key) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.createVariant(this.product.id, {
      sku,
      attributes: { [key]: value || 'test' },
      price: Number(this.newVariantPrice ?? 0),
    })
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.newVariantSku = '';
          this.message = 'Variante creada.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  deleteVariant(variantId: number) {
    if (!this.product) return;

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.deleteVariant(this.product.id, variantId)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.message = 'Variante eliminada.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  // ===== Variant Images =====
  addVariantImage(variantId: number) {
    if (!this.product) return;

    const url = (this.variantImageUrlByVariantId[variantId] ?? '').trim();
    if (!url) return;

    const type = this.variantImageTypeByVariantId[variantId] ?? 'GALLERY';

    this.error = '';
    this.message = '';
    this.busy = true;

    this.repo.addVariantImage(this.product.id, variantId, {
      url,
      type, // OBLIGATORIO
      position: this.variantImagePositionByVariantId[variantId] ?? undefined,
    })
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => {
          this.variantImageUrlByVariantId[variantId] = '';
          this.variantImagePositionByVariantId[variantId] = null;
          this.message = 'Imagen de variante agregada.';
          this.refresh();
        },
        error: (e) => (this.error = this.prettyErr(e)),
      });
  }

  private prettyErr(err: any): string {
    return err?.error?.message
      ?? err?.message
      ?? JSON.stringify(err);
  }
}
