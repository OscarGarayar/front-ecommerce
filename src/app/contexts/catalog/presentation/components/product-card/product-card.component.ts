import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../domain/model/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100">

      <div class="relative aspect-[4/5] bg-gray-100 overflow-hidden">

        <img *ngIf="mainImage; else placeholder"
             [src]="mainImage"
             [alt]="product.name"
             class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out">

        <ng-template #placeholder>
          <div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
        </ng-template>

        <div class="absolute top-3 left-3 flex flex-col gap-1">
          <span *ngIf="!product.price" class="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            Agotado
          </span>
          <span *ngIf="product.status === 'PUBLISHED'" class="px-2 py-1 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
            Nuevo
          </span>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <a [routerLink]="['/shop/product', product.id]"
             class="block w-full bg-white text-gray-900 text-center text-sm font-bold py-3 rounded-lg shadow-lg hover:bg-gray-900 hover:text-white transition-colors cursor-pointer">
            Ver Opciones
          </a>
        </div>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <p class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
          {{ product.category || 'General' }}
        </p>

        <h3 class="text-base font-semibold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1" [title]="product.name">
          {{ product.name }}
        </h3>

        <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
          {{ product.description || 'Sin descripción.' }}
        </p>

        <div class="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
          <div class="flex flex-col">
            <span class="text-xs text-gray-400">Desde</span>
            <span class="text-lg font-bold text-gray-900">
              S/ {{ product.price | number:'1.2-2' }}
            </span>
          </div>

          <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            →
          </div>
        </div>
      </div>

    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  get mainImage(): string | null {
    if (!this.product.images || this.product.images.length === 0) return null;
    // Priorizamos la que sea PRIMARY, si no, la primera
    const primary = this.product.images.find(img => img.type === 'PRIMARY');
    return primary ? primary.url : this.product.images[0].url;
  }
}
