import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { Product, ProductVariant } from '../../../domain/model/product';
import { AppConfig } from '../../../../../core/config/app-config';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Nuevos Imports para Auth
import { SessionStore } from '../../../../../core/state/session.store';
import {AuthModalComponent, AuthMode} from "../../../../iam/presentation/components/auth-modal/auth-modal.component";
import {HttpAuthRepository} from "../../../../iam/data/repositories/http-auth.repository";

interface GalleryItem { url: string; isVariant: boolean; }

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthModalComponent], // Importar el Modal
  template: `
    <div class="min-h-screen bg-white font-sans flex flex-col">

      <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a routerLink="/shop" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group">
            <span class="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span class="text-sm font-medium">Volver a la tienda</span>
          </a>

          <div class="text-xl font-bold text-gray-900 tracking-tight">Bambinos Store</div>

          <div class="flex items-center gap-4 text-sm w-auto justify-end">

             <ng-container *ngIf="!(session.state$ | async)?.token">
                <button (click)="openAuthModal('LOGIN')" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                  Iniciar Sesión
                </button>
                <button (click)="openAuthModal('SIGNUP')" class="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-transform hover:scale-105 shadow-sm font-medium">
                  Registrarse
                </button>
             </ng-container>

             <ng-container *ngIf="(session.state$ | async) as state">
               <div *ngIf="state.token" class="flex items-center gap-3">

                  <a *ngIf="state.role === 'ROLE_ADMIN'"
                     href="/admin"
                     class="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-xs uppercase tracking-wide">
                     <span>⚙️</span> Panel Admin
                  </a>

                  <span class="text-gray-600 hidden sm:block">Hola, Cliente</span>

                  <button (click)="logout()" class="text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
                    Salir
                  </button>
               </div>
             </ng-container>

          </div>
        </nav>
      </header>

      <div *ngIf="loading" class="flex-1 flex items-center justify-center">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div class="text-xs text-gray-400">Cargando producto...</div>
        </div>
      </div>

      <div *ngIf="!loading && product" class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">

          <div class="flex flex-col-reverse lg:flex-row gap-4 sticky top-24">
            <div class="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 lg:h-[600px] py-1 px-1 no-scrollbar scroll-smooth">
              <button *ngFor="let img of galleryImages"
                      (click)="selectedImage = img.url"
                      [class.ring-2]="selectedImage === img.url"
                      [class.ring-indigo-600]="selectedImage === img.url"
                      [class.opacity-50]="selectedImage !== img.url"
                      class="relative flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-100 transition-all focus:outline-none bg-white">
                <img [src]="img.url" class="w-full h-full object-cover">
                <span *ngIf="img.isVariant" class="absolute bottom-0 right-0 w-2 h-2 bg-indigo-500 rounded-tl-md"></span>
              </button>
            </div>
            <div class="relative w-full aspect-[4/5] lg:h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
              <img [src]="selectedImage || 'assets/placeholder.png'"
                   class="w-full h-full object-contain object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105">
            </div>
          </div>

          <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div class="mb-6 border-b border-gray-100 pb-6">
              <h2 class="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">{{ product.category }}</h2>
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">{{ product.name }}</h1>

              <div class="flex items-baseline gap-3">
                <p class="text-3xl font-medium text-gray-900">
                  <span *ngIf="checkingStock" class="text-gray-400 text-xl animate-pulse">Calculando...</span>
                  <span *ngIf="!checkingStock">S/ {{ (selectedVariant ? currentPrice : (product.price || 0)) | number:'1.2-2' }}</span>
                </p>
                <span *ngIf="!selectedVariant" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                   {{ errorMessage ? 'No disponible' : 'Precio base' }}
                </span>
              </div>
            </div>

            <div class="prose prose-sm text-gray-600 mb-8 leading-relaxed" [innerHTML]="product.description"></div>

            <div class="space-y-8">
              <div *ngIf="uniqueSizes.length > 0">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-bold text-gray-900">Talla</h3>
                </div>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  <button *ngFor="let size of uniqueSizes"
                          (click)="selectAttribute('Size', size)"
                          [class.ring-2]="selectedAttributes['Size'] === size"
                          [class.ring-indigo-600]="selectedAttributes['Size'] === size"
                          [class.bg-indigo-50]="selectedAttributes['Size'] === size"
                          [class.text-indigo-700]="selectedAttributes['Size'] === size"
                          [class.text-gray-700]="selectedAttributes['Size'] !== size"
                          [class.border-gray-200]="selectedAttributes['Size'] !== size"
                          [class.border-indigo-200]="selectedAttributes['Size'] === size"
                          class="border bg-white rounded-md py-3 text-sm font-bold uppercase hover:border-indigo-300 focus:outline-none transition-all shadow-sm">
                    {{ size }}
                  </button>
                </div>
              </div>

              <div *ngIf="uniqueColors.length > 0">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-bold text-gray-900">Color: <span class="text-gray-500 font-normal">{{ selectedAttributes['Color'] }}</span></h3>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button *ngFor="let color of uniqueColors"
                          (click)="selectAttribute('Color', color)"
                          [disabled]="!isColorAvailable(color)"
                          [class.ring-2]="selectedAttributes['Color'] === color"
                          [class.ring-indigo-600]="selectedAttributes['Color'] === color"
                          [class.ring-offset-2]="selectedAttributes['Color'] === color"
                          [class.opacity-30]="!isColorAvailable(color)"
                          [class.cursor-not-allowed]="!isColorAvailable(color)"
                          [class.grayscale]="!isColorAvailable(color)"
                          class="relative h-12 w-12 rounded-full border border-gray-200 shadow-sm focus:outline-none transition-transform hover:scale-110 active:scale-95 flex items-center justify-center group/color"
                          [style.background-color]="getColorHex(color)"
                          [title]="color">
                    <svg *ngIf="selectedAttributes['Color'] === color"
                         [class.text-white]="isDarkColor(color)"
                         [class.text-gray-900]="!isDarkColor(color)"
                         class="h-6 w-6 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div *ngIf="!isColorAvailable(color)" class="absolute inset-0 flex items-center justify-center">
                      <div class="h-0.5 w-full bg-gray-400 rotate-45"></div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="min-h-[3rem]">
                <div *ngIf="selectedVariant && !checkingStock && !errorMessage" class="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between animate-fade-in">
                  <div class="flex items-center gap-2">
                       <span class="relative flex h-3 w-3">
                         <span *ngIf="currentStock > 0" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span [class.bg-green-500]="currentStock > 0" [class.bg-red-500]="currentStock <= 0" class="relative inline-flex rounded-full h-3 w-3"></span>
                       </span>
                    <span [class.text-green-700]="currentStock > 0" [class.text-red-700]="currentStock <= 0" class="text-sm font-bold">
                         {{ currentStock > 0 ? 'En Stock' : 'Agotado' }}
                       </span>
                  </div>
                  <span class="text-xs text-gray-500 font-mono">SKU: {{ selectedVariant.sku }}</span>
                </div>

                <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-fade-in">
                  <span>⚠️</span>
                  <span class="font-medium">{{ errorMessage }}</span>
                  <span class="text-xs opacity-75">(Prueba otro color o talla)</span>
                </div>
              </div>

              <div class="pt-2">
                <button (click)="addToCart()"
                        [disabled]="!canAddToCart"
                        class="w-full bg-gray-900 border border-transparent rounded-full py-5 px-8 flex items-center justify-center text-lg font-bold text-white hover:bg-black hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-[0.99]">
                  {{ getButtonText() }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <app-auth-modal [(isOpen)]="showAuthModal" [initialMode]="authMode"></app-auth-modal>

    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;

  // AUTH STATE
  showAuthModal = false;
  authMode: AuthMode = 'LOGIN';

  selectedImage: string | null = null;
  galleryImages: GalleryItem[] = [];
  selectedAttributes: { Size?: string; Color?: string } = {};
  selectedVariant: ProductVariant | null = null;
  currentPrice: number = 0;
  currentStock: number = 0;
  checkingStock = false;
  errorMessage = '';
  uniqueSizes: string[] = [];
  uniqueColors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private catalog: HttpCatalogRepository,
    private http: HttpClient,
    private authRepo: HttpAuthRepository,
    public session: SessionStore
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  // --- MÉTODOS AUTH ---
  openAuthModal(mode: AuthMode) {
    this.authMode = mode;
    this.showAuthModal = true;
  }

  logout() {
    this.authRepo.logout();
  }

  // --- MÉTODOS CATALOG (Tu lógica original intacta) ---
  loadProduct(id: string) {
    this.loading = true;
    this.catalog.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.buildGallery(p);
        this.extractAttributes(p);
        if (p.variants && p.variants.length > 0) {
          this.autoSelectVariant(p.variants[0]);
        } else {
          this.currentPrice = p.price || 0;
        }
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  buildGallery(p: Product) {
    const images = new Map<string, GalleryItem>();
    if (p.images) p.images.forEach(img => images.set(img.url, { url: img.url, isVariant: false }));
    if (p.variants) {
      p.variants.forEach(v => {
        if (v.images) {
          v.images.forEach(imgUrl => {
            const urlStr = typeof imgUrl === 'string' ? imgUrl : (imgUrl as any).url;
            if (urlStr && !images.has(urlStr)) images.set(urlStr, { url: urlStr, isVariant: true });
          });
        }
      });
    }
    this.galleryImages = Array.from(images.values());
    if (this.galleryImages.length > 0) this.selectedImage = this.galleryImages[0].url;
  }

  extractAttributes(p: Product) {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    if (p.variants) {
      p.variants.forEach(v => {
        const attrs: any = v.attributes || {};
        const sizeVal = attrs['Size'] || attrs['size'] || attrs['Talla'];
        const colorVal = attrs['Color'] || attrs['color'];
        if (sizeVal) sizes.add(sizeVal);
        if (colorVal) colors.add(colorVal);
      });
    }
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'U'];
    this.uniqueSizes = Array.from(sizes).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
    this.uniqueColors = Array.from(colors).sort();
  }

  autoSelectVariant(v: ProductVariant) {
    const attrs: any = v.attributes || {};
    const sizeVal = attrs['Size'] || attrs['size'] || attrs['Talla'];
    const colorVal = attrs['Color'] || attrs['color'];
    if (sizeVal) this.selectAttribute('Size', sizeVal);
    if (colorVal) this.selectAttribute('Color', colorVal);
  }

  selectAttribute(key: 'Size' | 'Color', value: string) {
    this.selectedAttributes[key] = value;
    this.findVariantAndFetchData();
  }

  findVariantAndFetchData() {
    if (!this.product) return;
    const targetSize = this.selectedAttributes['Size'];
    const targetColor = this.selectedAttributes['Color'];
    if (!targetSize && !targetColor) return;

    const variant = this.product.variants.find(v => {
      const attrs: any = v.attributes || {};
      const sVal = attrs['Size'] || attrs['size'] || attrs['Talla'];
      const cVal = attrs['Color'] || attrs['color'];
      return sVal === targetSize && cVal === targetColor;
    });

    if (variant) {
      this.selectedVariant = variant;
      this.errorMessage = '';
      this.fetchVariantLiveData(variant.id);
      if (variant.images && variant.images.length > 0) {
        const variantImg = typeof variant.images[0] === 'string' ? variant.images[0] : (variant.images[0] as any).url;
        if (variantImg) this.selectedImage = variantImg;
      }
    } else {
      if (targetSize && targetColor) {
        this.selectedVariant = null;
        this.currentStock = 0;
        this.errorMessage = 'No Stock';
      }
    }
  }

  fetchVariantLiveData(variantId: number) {
    this.checkingStock = true;
    const priceReq = this.http.get<any>(`${AppConfig.apiBaseUrl}/api/v1/pricing/prices/${variantId}`).pipe(
      catchError(() => of({ basePrice: this.product?.price || 0 }))
    );
    const stockReq = this.http.get<any>(`${AppConfig.apiBaseUrl}/api/v1/inventory/items/${variantId}`).pipe(
      catchError(() => of({ quantityOnHand: 0 }))
    );

    forkJoin([priceReq, stockReq]).subscribe({
      next: ([priceRes, stockRes]) => {
        this.currentPrice = priceRes.finalPrice ?? priceRes.basePrice ?? 0;
        this.currentStock = stockRes.quantityOnHand ?? 0;
        this.checkingStock = false;
      },
      error: () => this.checkingStock = false
    });
  }

  isColorAvailable(color: string): boolean {
    if (!this.selectedAttributes['Size']) return true;
    return this.product?.variants.some(v => {
      const attrs: any = v.attributes || {};
      const sVal = attrs['Size'] || attrs['size'] || attrs['Talla'];
      const cVal = attrs['Color'] || attrs['color'];
      return cVal === color && sVal === this.selectedAttributes['Size'];
    }) ?? false;
  }

  isSizeAvailable(size: string): boolean { return true; }

  get canAddToCart(): boolean { return !!this.selectedVariant && !this.checkingStock && this.currentStock > 0; }

  getButtonText(): string {
    if (this.uniqueSizes.length > 0 && !this.selectedAttributes['Size']) return 'Elige Talla';
    if (this.uniqueColors.length > 0 && !this.selectedAttributes['Color']) return 'Elige Color';
    if (this.selectedAttributes['Size'] && this.selectedAttributes['Color'] && !this.selectedVariant) return 'No disponible';
    if (!this.selectedVariant) return 'No disponible';
    if (this.checkingStock) return 'Verificando...';
    if (this.currentStock <= 0) return 'Agotado';
    return 'Agregar al Carrito';
  }

  getColorHex(name: string): string {
    const map: any = { 'Negro': '#111', 'Blanco': '#fff', 'Rojo': '#ef4444', 'Azul': '#3b82f6', 'Verde': '#22c55e', 'Beige': '#f5f5dc', 'Gris': '#9ca3af', 'Amarillo': '#eab308' };
    return map[name] || '#eee';
  }

  isDarkColor(color: string): boolean {
    return ['Negro', 'Azul', 'Rojo', 'Verde'].includes(color);
  }

  addToCart() {
    if (!this.canAddToCart || !this.selectedVariant || !this.product) return;
    alert(`Agregado al carrito: ${this.product.name} (${this.selectedVariant.sku})`);
  }
}
