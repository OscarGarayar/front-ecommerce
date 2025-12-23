import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../domain/model/product';
import { AppConfig } from '../../../../../core/config/app-config';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div (click)="navigateToDetail()"
         (mouseenter)="startSlideshow()"
         (mouseleave)="stopSlideshow()"
         class="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-100">

      <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <img [src]="currentImage"
             class="w-full h-full object-cover object-center transition-opacity duration-500"
             [class.opacity-100]="imageLoaded"
             [class.opacity-0]="!imageLoaded"
             (load)="imageLoaded = true">

        <div *ngIf="!currentImage" class="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
          <span class="text-4xl">📦</span>
        </div>

        <div *ngIf="imagesList.length > 1 && isHovering" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
           <span *ngFor="let img of imagesList" class="w-1.5 h-1.5 rounded-full transition-colors"
                 [class.bg-indigo-600]="currentImage === img" [class.bg-white]="currentImage !== img"></span>
        </div>

        <div class="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span *ngIf="product.status === 'PUBLISHED'" class="px-2 py-1 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
            Nuevo
          </span>
        </div>

        <button (click)="onAddToCart($event)"
                class="absolute bottom-4 right-4 bg-white text-indigo-600 p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white z-20 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </button>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ product.category || 'General' }}</p>
        <h3 class="text-base font-semibold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{{ product.name }}</h3>

        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-lg font-bold text-gray-900">
             <ng-container *ngIf="loadingPrice; else showPrice">
               <span class="text-gray-300 text-sm animate-pulse">...</span>
             </ng-container>
             <ng-template #showPrice>
               {{ displayPrice > 0 ? ('S/ ' + (displayPrice | number:'1.2-2')) : 'Consultar' }}
             </ng-template>
          </span>
          <span class="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  // ¡NUEVO! Evento para avisar al padre el precio real
  @Output() priceLoaded = new EventEmitter<{id: number, price: number}>();

  currentImage: string | null = null;
  imagesList: string[] = [];
  imageLoaded = false;
  isHovering = false;
  displayPrice: number = 0;
  loadingPrice = false;
  private intervalId: any;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.initImages();
    this.initPrice();
  }

  ngOnDestroy() { this.stopSlideshow(); }

  private initPrice() {
    this.displayPrice = this.product.price || 0;

    // Si ya viene el precio, emitimos de una vez para que el filtro funcione
    if (this.displayPrice > 0) {
      this.priceLoaded.emit({ id: this.product.id, price: this.displayPrice });
    }
    // Si no, lo buscamos
    else if (this.product.variants && this.product.variants.length > 0) {
      this.fetchPrice(this.product.variants[0].id);
    }
  }

  fetchPrice(variantId: number) {
    this.loadingPrice = true;
    const url = `${AppConfig.apiBaseUrl}/api/v1/pricing/prices/${variantId}`;
    this.http.get<any>(url).pipe(catchError(() => of({ basePrice: 0 }))).subscribe({
      next: (res) => {
        this.displayPrice = res.finalPrice ?? res.basePrice ?? 0;
        this.loadingPrice = false;
        // AVISAMOS AL PADRE
        if (this.displayPrice > 0) {
          this.priceLoaded.emit({ id: this.product.id, price: this.displayPrice });
        }
      },
      error: () => this.loadingPrice = false
    });
  }

  private initImages() {
    this.imagesList = [];
    if (this.product.images?.length > 0) {
      this.imagesList = this.product.images.map(img => img.url);
      const primary = this.product.images.find(img => img.type === 'PRIMARY');
      this.currentImage = primary ? primary.url : this.imagesList[0];
    }
  }

  startSlideshow() {
    this.isHovering = true;
    if (this.imagesList.length <= 1) return;
    let index = this.imagesList.indexOf(this.currentImage || '') || 0;
    this.intervalId = setInterval(() => {
      index = (index + 1) % this.imagesList.length;
      this.currentImage = this.imagesList[index];
    }, 1200);
  }

  stopSlideshow() {
    this.isHovering = false;
    clearInterval(this.intervalId);
    this.initImages();
  }

  navigateToDetail() { this.router.navigate(['/shop/product', this.product.id]); }
  onAddToCart(e: Event) { e.stopPropagation(); this.addToCart.emit(this.product); }
}
