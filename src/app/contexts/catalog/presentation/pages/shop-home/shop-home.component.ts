import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { Product } from '../../../domain/model/product';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-shop-home',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, NgClass, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans flex flex-col">

      <header class="bg-white shadow-sm sticky top-0 z-50 h-16 flex-none">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div class="flex items-center gap-2 cursor-pointer" (click)="resetFilters()">
            <span class="text-2xl font-bold text-indigo-600 tracking-tight">Storefront</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <a href="/customer/login" class="text-gray-500 hover:text-gray-900">Entrar</a>
            <a href="/customer/signup" class="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Crear Cuenta
            </a>
          </div>
        </nav>
      </header>

      <div class="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">

        <aside class="w-64 flex-shrink-0 hidden md:block">
          <div class="sticky top-24">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Categorías</h3>
            <ul class="space-y-2">
              <li>
                <button
                  (click)="selectedCategory = ''"
                  [class.text-indigo-600]="selectedCategory === ''"
                  [class.font-bold]="selectedCategory === ''"
                  class="text-gray-600 hover:text-indigo-600 w-full text-left transition-colors">
                  Todas
                </button>
              </li>
              <li *ngFor="let cat of uniqueCategories">
                <button
                  (click)="selectedCategory = cat"
                  [class.text-indigo-600]="selectedCategory === cat"
                  [class.font-bold]="selectedCategory === cat"
                  class="text-gray-600 hover:text-indigo-600 w-full text-left transition-colors capitalize">
                  {{ cat }}
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <main class="flex-1">

          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                [(ngModel)]="searchTerm"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              >
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="text-sm text-gray-500">
              Mostrando {{ filteredProducts.length }} productos
            </div>
          </div>

          <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white h-80 rounded-xl border border-gray-200"></div>
          </div>

          <div *ngIf="!loading && filteredProducts.length === 0" class="text-center py-20 bg-white rounded-xl border border-dashed">
            <p class="text-gray-500">No encontramos productos con esos filtros.</p>
            <button (click)="resetFilters()" class="mt-2 text-indigo-600 hover:underline">Limpiar filtros</button>
          </div>

          <div *ngIf="!loading && filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <div *ngFor="let p of filteredProducts" class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">

              <div class="h-56 w-full relative bg-gray-100 flex items-center justify-center overflow-hidden">

                <img *ngIf="getMainImage(p) as imgUrl; else placeholder"
                     [src]="imgUrl"
                     alt="{{ p.name }}"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

                <ng-template #placeholder>
                  <span class="text-4xl opacity-30 select-none">📦</span>
                </ng-template>

                <div class="absolute top-2 right-2">
                   <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
                    {{ p.status }}
                  </span>
                </div>
              </div>


              <div class="p-5 flex-1 flex flex-col">
                <p class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {{ p.category }}
                </p>
                <h3 class="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                  {{ p.name }}
                </h3>

                <p class="text-sm text-gray-500 line-clamp-2 mb-4">
                   {{ p.description || 'Sin descripción disponible.' }}
                </p>

                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-xs text-gray-400">Precio</span>
                    <span class="text-xl font-bold text-gray-900">
                       {{ p.price ? ('S/ ' + p.price) : 'Consultar' }}
                     </span>
                  </div>
                  <a [routerLink]="['/shop/product', p.id]" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center cursor-pointer">
                    Ver Detalle <span class="ml-1">→</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  `,
})
export class ShopHomeComponent implements OnInit {
  rawProducts: Product[] = []; // Todos los productos traídos del back
  uniqueCategories: string[] = []; // Categorías extraídas dinámicamente
  loading = true;

  // Variables para filtros
  searchTerm = '';
  selectedCategory = '';

  constructor(private catalog: HttpCatalogRepository) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // USAMOS EL NUEVO MÉTODO DEL REPOSITORIO
    this.catalog.getProductCards(0, 50).subscribe({
      next: (data) => {
        this.rawProducts = data;
        // Nota: extractCategories() no funcionará bien si el endpoint no trae categorías,
        // pero el precio sí se verá.
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  // Extrae categorías únicas de la lista de productos
  private extractCategories() {
    const categories = this.rawProducts.map(p => p.category).filter(c => !!c) as string[];
    this.uniqueCategories = [...new Set(categories)]; // Elimina duplicados
  }

  // Getter inteligente que aplica los filtros
  get filteredProducts(): Product[] {
    return this.rawProducts.filter(p => {
      // 1. Filtro por Texto (Nombre o Descripción)
      const matchesSearch =
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // 2. Filtro por Categoría
      const matchesCategory = this.selectedCategory
        ? p.category === this.selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  // Helper para sacar la imagen principal
  getMainImage(product: Product): string | null {
    if (!product.images || product.images.length === 0) return null;
    // Intenta buscar la que sea 'PRIMARY', si no, devuelve la primera
    const primary = product.images.find(img => img.type === 'PRIMARY');
    return primary ? primary.url : product.images[0].url;
  }
}
