import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-product-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 h-full">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
        Detalles Generales
      </h3>
      <div class="space-y-4">
        <div>
          <span class="block text-xs text-gray-500 uppercase">Categoría</span>
          <span class="block text-sm font-medium text-gray-900 bg-gray-100 p-2 rounded mt-1">
            {{ category }}
          </span>
        </div>
        <div>
          <span class="block text-xs text-gray-500 uppercase">Descripción</span>
          <div class="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600 min-h-[5rem] whitespace-pre-wrap">
            {{ description || 'Sin descripción' }}
          </div>
        </div>
        <div>
          <span class="block text-xs text-gray-500 uppercase">Estado Actual</span>
          <span class="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                [ngClass]="status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
            {{ status }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class AdminProductInfoComponent {
  @Input() category = '';
  @Input() description: string | null = '';
  @Input() status = '';
}
