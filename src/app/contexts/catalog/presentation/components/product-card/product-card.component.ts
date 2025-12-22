import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../../domain/model/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="navigateToDetail()"
         (mouseenter)="startSlideshow()"
         (mouseleave)="stopSlideshow()"
         class="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-100">

      <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">

        <img [src]="currentImage"
             [alt]="product.name"
             class="w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out"
             [class.opacity-100]="imageLoaded"
             [class.opacity-0]="!imageLoaded"
             (load)="imageLoaded = true">

        <div *ngIf="!currentImage" class="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
           <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>

        <div *ngIf="imagesList.length > 1 && isHovering" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
           <span *ngFor="let img of imagesList; let i = index"
                 class="w-1.5 h-1.5 rounded-full transition-colors"
                 [class.bg-indigo-600]="currentImage === img"
                 [class.bg-white]="currentImage !== img">
           </span>
        </div>

        <div class="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span *ngIf="product.status === 'PUBLISHED'" class="px-2 py-1 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
            Nuevo
          </span>
        </div>

        <button (click)="onAddToCart($event)"
                class="absolute bottom-4 right-4 bg-white text-indigo-600 p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white z-20 flex items-center justify-center"
                title="Añadir al carrito">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </button>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ product.category || 'General' }}</p>

        <h3 class="text-base font-semibold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
          {{ product.name }}
        </h3>

        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-lg font-bold text-gray-900">
            S/ {{ product.price | number:'1.2-2' }}
          </span>
          <span class="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            →
          </span>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  currentImage: string | null = null;
  imagesList: string[] = [];

  imageLoaded = false;
  isHovering = false;
  private intervalId: any;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.initImages();
    }
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  private initImages() {
    this.imagesList = [];

    if (this.product.images && this.product.images.length > 0) {
      // Extraemos todas las URLs disponibles
      this.imagesList = this.product.images.map(img => img.url);

      // Buscamos la principal para mostrarla primero
      const primary = this.product.images.find(img => img.type === 'PRIMARY');
      this.currentImage = primary ? primary.url : this.imagesList[0];
    } else {
      this.currentImage = null;
    }
  }

  // --- LÓGICA DE SLIDESHOW ---

  startSlideshow() {
    this.isHovering = true;
    if (this.imagesList.length <= 1) return;

    // Empezamos a rotar
    let index = this.imagesList.indexOf(this.currentImage || '') || 0;

    this.intervalId = setInterval(() => {
      index = (index + 1) % this.imagesList.length;
      this.currentImage = this.imagesList[index];
    }, 1500); // Cambia imagen cada 1.5 segundos
  }

  stopSlideshow() {
    this.isHovering = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Opcional: Volver a la imagen principal al salir
    this.initImages();
  }

  // --- NAVEGACIÓN ---

  navigateToDetail() {
    this.router.navigate(['/shop/product', this.product.id]);
  }

  onAddToCart(event: Event) {
    // IMPORTANTE: Detenemos la propagación para no activar el click de la tarjeta
    event.stopPropagation();

    // Emitimos evento para que el padre decida (o navegamos si requiere opciones)
    console.log('🛒 Botón rápido clickeado para:', this.product.name);

    // Lógica simple: si tiene variantes complejas, mejor ir al detalle
    // Si no, añadir directo (o emitir evento)
    this.addToCart.emit(this.product);

    // Feedback visual rápido
    const btn = event.currentTarget as HTMLElement;
    btn.classList.add('bg-green-600', 'text-white');
    setTimeout(() => btn.classList.remove('bg-green-600', 'text-white'), 1000);
  }
}
