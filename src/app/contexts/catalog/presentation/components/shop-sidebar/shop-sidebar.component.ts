import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
  parentId?: number | null;
}

@Component({
  selector: 'app-shop-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sticky top-24 space-y-8">

      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex justify-between">
          Categorías
          <button *ngIf="selectedCategory" (click)="selectCategory(null)" class="text-xs text-red-500 font-normal hover:underline">(Borrar)</button>
        </h3>

        <div class="space-y-1">
          <div (click)="selectCategory(null)"
               class="cursor-pointer py-1 px-2 rounded hover:bg-gray-100 text-sm"
               [class.text-indigo-600]="!selectedCategory" [class.font-bold]="!selectedCategory">
             📂 Todas
          </div>
          <ng-container *ngTemplateOutlet="recursiveList; context:{ $implicit: categoriesTree }"></ng-container>
        </div>

        <ng-template #recursiveList let-nodes>
          <ul class="pl-2 border-l border-gray-200 ml-2 space-y-1">
            <li *ngFor="let node of nodes">
              <details *ngIf="node.children.length > 0" class="group">
                <summary class="list-none flex items-center justify-between cursor-pointer py-1 px-2 rounded hover:bg-gray-50 text-sm text-gray-600">
                  <span (click)="selectCategory(node.name)" [class.text-indigo-600]="selectedCategory === node.name" class="hover:text-indigo-600">
                    {{ node.name }}
                  </span>
                  <span class="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <ng-container *ngTemplateOutlet="recursiveList; context:{ $implicit: node.children }"></ng-container>
              </details>
              <div *ngIf="node.children.length === 0" (click)="selectCategory(node.name)"
                   class="cursor-pointer py-1 px-2 rounded hover:bg-gray-100 text-sm text-gray-600 flex items-center"
                   [class.text-indigo-600]="selectedCategory === node.name" [class.font-bold]="selectedCategory === node.name">
                 <span class="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2" [class.bg-indigo-400]="selectedCategory === node.name"></span>
                 {{ node.name }}
              </div>
            </li>
          </ul>
        </ng-template>
      </div>

      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">Precio</h3>
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
           <div class="flex gap-2">
             <input type="number" [(ngModel)]="minPrice" placeholder="Min" class="w-full text-sm border-gray-300 rounded p-1">
             <input type="number" [(ngModel)]="maxPrice" placeholder="Max" class="w-full text-sm border-gray-300 rounded p-1">
           </div>
           <button (click)="applyPrice()" class="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded hover:bg-black">Filtrar</button>
           <button *ngIf="minPrice || maxPrice" (click)="resetPrice()" class="w-full text-xs text-gray-500 underline">Limpiar precio</button>
        </div>
      </div>
    </div>
  `
})
export class ShopSidebarComponent {
  @Input() categoriesTree: CategoryNode[] = [];
  @Input() selectedCategory: string = '';
  @Output() categoryChange = new EventEmitter<string>();
  @Output() priceChange = new EventEmitter<{ min: number | null, max: number | null }>();

  minPrice: number | null = null;
  maxPrice: number | null = null;

  selectCategory(name: string | null) { this.categoryChange.emit(name || ''); }
  applyPrice() { this.priceChange.emit({ min: this.minPrice, max: this.maxPrice }); }
  resetPrice() { this.minPrice = null; this.maxPrice = null; this.applyPrice(); }
}
