import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { HttpAuthRepository } from '../../../../iam/data/repositories/http-auth.repository';
import { SessionStore } from '../../../../../core/state/session.store';
import { Product } from '../../../domain/model/product';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ShopSidebarComponent, CategoryNode } from '../../components/shop-sidebar/shop-sidebar.component';
import { AuthModalComponent, AuthMode } from '../../../../iam/presentation/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, ProductCardComponent, ShopSidebarComponent, AuthModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans flex flex-col">

      <header class="bg-white shadow-sm sticky top-0 z-50 h-16 flex-none">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div class="flex items-center gap-2 cursor-pointer group" (click)="resetFilters()">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors">B</div>
            <span class="text-xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">Bambinos</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <ng-container *ngIf="!(session.state$ | async)?.token">
              <button (click)="openAuthModal('LOGIN')" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Iniciar Sesión</button>
              <button (click)="openAuthModal('SIGNUP')" class="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-transform hover:scale-105 shadow-sm font-medium">Registrarse</button>
            </ng-container>
            <ng-container *ngIf="(session.state$ | async) as state">
              <div *ngIf="state.token" class="flex items-center gap-3">
                <a *ngIf="state.role === 'ROLE_ADMIN'" href="/admin" class="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-xs uppercase tracking-wide"><span>⚙️</span> Panel Admin</a>
                <span class="text-gray-600 hidden sm:block">Hola, Cliente</span>
                <button (click)="logout()" class="text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition-colors text-xs">Salir</button>
              </div>
            </ng-container>
          </div>
        </nav>
      </header>

      <div class="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">

        <aside class="w-64 flex-shrink-0 hidden md:block">
          <app-shop-sidebar
            [categoriesTree]="categoriesTree"
            [selectedCategory]="selectedCategory"
            (categoryChange)="selectedCategory = $event"
            (priceChange)="handlePriceFilter($event)">
          </app-shop-sidebar>
        </aside>

        <main class="flex-1">
          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative max-w-md w-full">
              <input type="text" placeholder="Buscar productos..." [(ngModel)]="searchTerm" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
            </div>
            <div class="text-sm text-gray-500">Mostrando {{ filteredProducts.length }} productos</div>
          </div>

          <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white h-80 rounded-xl border border-gray-200"></div>
          </div>

          <div *ngIf="!loading && filteredProducts.length === 0" class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div class="text-4xl mb-3">🔍</div>
            <p class="text-gray-500">No encontramos productos con esos filtros.</p>
            <button (click)="resetFilters()" class="text-indigo-600 font-bold hover:underline mt-2">Limpiar filtros</button>
          </div>

          <div *ngIf="!loading && filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-product-card
              *ngFor="let p of filteredProducts"
              [product]="p"
              (priceLoaded)="updateProductPrice($event)"
              (addToCart)="handleAddToCart($event)">
            </app-product-card>
          </div>
        </main>
      </div>

      <app-auth-modal [(isOpen)]="showAuthModal" [initialMode]="authMode"></app-auth-modal>
    </div>
  `,
})
export class ShopHomeComponent implements OnInit {
  rawProducts: Product[] = [];
  categoriesTree: CategoryNode[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  priceFilter: { min: number | null, max: number | null } = { min: null, max: null };

  showAuthModal = false;
  authMode: AuthMode = 'LOGIN';

  constructor(
    private catalog: HttpCatalogRepository,
    private authRepo: HttpAuthRepository,
    public session: SessionStore
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // 1. Cargar Productos (Traemos 100 para que el filtro tenga sentido)
    this.catalog.getProductCards(0, 100).subscribe({
      next: (data) => {
        this.rawProducts = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    // 2. Cargar Categorías y armar árbol
    this.catalog.getCategories().subscribe(cats => {
      this.categoriesTree = this.buildCategoryTree(cats);
    });
  }

  // --- ÁRBOL DE CATEGORÍAS ---
  private buildCategoryTree(flatList: any[]): CategoryNode[] {
    const map = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];
    flatList.forEach(c => map.set(c.id, { ...c, children: [] }));
    flatList.forEach(c => {
      const node = map.get(c.id);
      if (node) {
        if (c.parentId && map.has(c.parentId)) {
          map.get(c.parentId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });
    return roots;
  }

  // --- ACTUALIZACIÓN DE PRECIO DESDE LA CARD (CRUCIAL) ---
  updateProductPrice(event: { id: number, price: number }) {
    // Buscamos el producto en memoria y le ponemos el precio real
    const product = this.rawProducts.find(p => p.id === event.id);
    if (product) {
      product.price = event.price;
      // Forzamos detección de cambios (Angular lo hará auto por el binding, pero esto asegura el dato)
    }
  }

  // --- FILTRADO ---
  get filteredProducts(): Product[] {
    return this.rawProducts.filter(p => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term));
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;

      // Filtro Precio
      const price = p.price || 0;
      const min = this.priceFilter.min;
      const max = this.priceFilter.max;
      // Si el precio es 0 (aún cargando), lo mostramos solo si NO hay filtro de precio activo.
      // Si hay filtro activo, ocultamos los que aún no cargan precio (0) para no confundir.
      if (price === 0 && (min !== null || max !== null)) return false;

      const matchesMin = min === null || price >= min;
      const matchesMax = max === null || price <= max;

      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });
  }

  handlePriceFilter(range: { min: number | null, max: number | null }) { this.priceFilter = range; }
  resetFilters() { this.searchTerm = ''; this.selectedCategory = ''; this.priceFilter = { min: null, max: null }; }

  openAuthModal(mode: AuthMode) { this.authMode = mode; this.showAuthModal = true; }
  logout() { this.authRepo.logout(); }
  handleAddToCart(p: Product) { console.log('Add', p); alert(`Añadido: ${p.name}`); }
}
