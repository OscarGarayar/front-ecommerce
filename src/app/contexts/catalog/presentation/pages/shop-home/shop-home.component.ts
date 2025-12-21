import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe],
  template: `
    <div class="min-h-screen">
      <header class="border-b p-4 flex items-center justify-between">
        <div class="font-semibold">Storefront</div>

        <div class="flex gap-3 text-sm">
          <a class="underline" href="/customer/login">Login</a>
          <a class="underline" href="/customer/signup">Crear cuenta</a>
        </div>
      </header>


      <main class="p-6">
        <h1 class="text-2xl font-bold">Catálogo</h1>

        <div class="mt-4" *ngIf="products$ | async as products; else loading">
          <p *ngIf="products.length === 0" class="text-sm">
            No hay productos para mostrar.
          </p>

          <div *ngIf="products.length > 0" class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="border rounded p-4" *ngFor="let p of products">
              <div class="font-semibold">{{ p.name }}</div>

              <div class="text-sm mt-1" *ngIf="p.variants?.length; else noPrice">
                Precio: definir en variante
              </div>
              <div class="text-xs mt-1 text-gray-500">
                {{ p.category ?? 'Sin categoría' }} · {{ p.status ?? 'N/A' }}
              </div>


              <ng-template #noPrice>
                <div class="text-sm mt-1 text-gray-500">
                  Precio no definido (agrega una variante).
                </div>
              </ng-template>


            </div>
          </div>
        </div>

        <ng-template #loading>
          <p class="text-sm">Cargando productos...</p>
        </ng-template>
      </main>
    </div>
  `,
})
export class ShopHomeComponent {
  products$ = this.catalog.getProductsPage(0, 12);
  constructor(private catalog: HttpCatalogRepository) {}
}
