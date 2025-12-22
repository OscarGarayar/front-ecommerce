import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { Product } from '../../../domain/model/product';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ShopSidebarComponent } from '../../components/shop-sidebar/shop-sidebar.component';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, ProductCardComponent, ShopSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50/50 font-sans flex flex-col">

      <header class="bg-white sticky top-0 z-40 border-b border-gray-200">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2 cursor-pointer" (click)="resetFilters()">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span class="text-xl font-bold text-gray-900 tracking-tight">Bambinos Store</span>
          </div>

          <div class="flex items-center gap-6 text-sm font-medium">
            <a href="/customer/login" class="text-gray-500 hover:text-indigo-600 transition-colors">Iniciar Sesión</a>
            <a href="/customer/signup" class="px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-transform hover:scale-105 shadow-sm">
              Registrarse
            </a>
          </div>
        </nav>
      </header>

      <div class="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-10">

        <aside class="w-64 flex-shrink-0 hidden lg:block pt-2">
          <app-shop-sidebar
            [categories]="uniqueCategories"
            [selectedCategory]="selectedCategory"
            (categoryChange)="selectedCategory = $event">
          </app-shop-sidebar>
        </aside>

        <main class="flex-1">

          <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="relative flex-1 max-w-lg">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
              <input type="text" placeholder="Buscar pantalones, polos..." [(ngModel)]="searchTerm"
                     class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm outline-none">
            </div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {{ filteredProducts.length }} Resultados
            </div>
          </div>

          <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white h-[400px] rounded-2xl animate-pulse"></div>
          </div>

          <div *ngIf="!loading && filteredProducts.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <div class="text-6xl mb-4">🙈</div>
            <h3 class="text-lg font-bold text-gray-900">No encontramos productos</h3>
            <p class="text-gray-500 text-sm mb-6">Intenta con otra categoría o término de búsqueda.</p>
            <button (click)="resetFilters()" class="text-indigo-600 font-bold hover:underline">Limpiar filtros</button>
          </div>

          <div *ngIf="!loading && filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <app-product-card
              *ngFor="let p of filteredProducts"
              [product]="p">
            </app-product-card>
          </div>

        </main>
      </div>
    </div>
  `,
})
export class ShopHomeComponent implements OnInit {
  // ... (LA LÓGICA PERMANECE IGUAL QUE TU ARCHIVO ANTERIOR)
  rawProducts: Product[] = [];
  uniqueCategories: string[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';

  constructor(private catalog: HttpCatalogRepository) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.catalog.getProductCards(0, 50).subscribe({
      next: (data) => {
        this.rawProducts = data;
        this.extractCategories();
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  private extractCategories() {
    const categories = this.rawProducts.map(p => p.category).filter(c => !!c) as string[];
    this.uniqueCategories = [...new Set(categories)];
  }

  get filteredProducts(): Product[] {
    return this.rawProducts.filter(p => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term));
      const matchesCategory = this.selectedCategory ? p.category === this.selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
  }
}
