import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { Product } from '../../../domain/model/product';

// IMPORTS DE TUS NUEVOS MÓDULOS
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ShopSidebarComponent } from '../../components/shop-sidebar/shop-sidebar.component';
// (Opcional) Importar Navbar si lo creaste, sino dejar header inline por ahora

@Component({
  selector: 'app-shop-home',
  standalone: true,
  // Agregamos los componentes hijos a los imports
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, ProductCardComponent, ShopSidebarComponent],
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
          <app-shop-sidebar
            [categories]="uniqueCategories"
            [selectedCategory]="selectedCategory"
            (categoryChange)="selectedCategory = $event">
          </app-shop-sidebar>
        </aside>

        <main class="flex-1">

          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative max-w-md w-full">
              <input type="text" placeholder="Buscar productos..." [(ngModel)]="searchTerm"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
              </div>
            <div class="text-sm text-gray-500">
              Mostrando {{ filteredProducts.length }} productos
            </div>
          </div>

          <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white h-80 rounded-xl border border-gray-200"></div>
          </div>

          <div *ngIf="!loading && filteredProducts.length === 0" class="text-center py-20 bg-white rounded-xl border border-dashed">
             <p class="text-gray-500">No encontramos productos.</p>
             <button (click)="resetFilters()" class="text-indigo-600 underline mt-2">Limpiar filtros</button>
          </div>

          <div *ngIf="!loading && filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

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
        // Nota: Si el endpoint /cards NO trae categorías, esta línea no servirá.
        // Quizás necesites llamar a this.catalog.getCategories() aparte para llenar el sidebar.
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
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesCategory = this.selectedCategory ? p.category === this.selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  // La función 'getMainImage' ya no se necesita aquí, está dentro de app-product-card
}
