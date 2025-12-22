import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../domain/model/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">

      <div class="h-56 w-full relative bg-gray-100 flex items-center justify-center overflow-hidden">
        <img *ngIf="mainImage as imgUrl; else placeholder"
             [src]="imgUrl"
             [alt]="product.name"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">

        <ng-template #placeholder>
          <span class="text-4xl opacity-30 select-none">📦</span>
        </ng-template>

        <div class="absolute top-2 right-2">
           <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
            {{ product.status }}
          </span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col">
        <p class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          {{ product.category }}
        </p>
        <h3 class="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
          {{ product.name }}
        </h3>

        <p class="text-sm text-gray-500 line-clamp-2 mb-4">
           {{ product.description || 'Sin descripción disponible.' }}
        </p>

        <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-gray-400">Precio</span>
            <span class="text-xl font-bold text-gray-900">
               {{ product.price ? ('S/ ' + product.price) : 'Consultar' }}
             </span>
          </div>
          <a [routerLink]="['/shop/product', product.id]" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center cursor-pointer">
            Ver Detalle <span class="ml-1">→</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  // Recibimos el producto como Input
  @Input({ required: true }) product!: Product;

  // Lógica movida desde el padre
  get mainImage(): string | null {
    if (!this.product.images || this.product.images.length === 0) return null;
    const primary = this.product.images.find(img => img.type === 'PRIMARY');
    return primary ? primary.url : this.product.images[0].url;
  }
}
