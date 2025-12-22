import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sticky top-24">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Categorías</h3>
      <ul class="space-y-2">
        <li>
          <button
            (click)="selectCategory('')"
            [class.text-indigo-600]="selectedCategory === ''"
            [class.font-bold]="selectedCategory === ''"
            class="text-gray-600 hover:text-indigo-600 w-full text-left transition-colors">
            Todas
          </button>
        </li>

        <li *ngFor="let cat of categories">
          <button
            (click)="selectCategory(cat)"
            [class.text-indigo-600]="selectedCategory === cat"
            [class.font-bold]="selectedCategory === cat"
            class="text-gray-600 hover:text-indigo-600 w-full text-left transition-colors capitalize">
            {{ cat }}
          </button>
        </li>
      </ul>
    </div>
  `
})
export class ShopSidebarComponent {
  @Input() categories: string[] = [];
  @Input() selectedCategory: string = '';

  // Emitimos evento al padre cuando el usuario hace clic
  @Output() categoryChange = new EventEmitter<string>();

  selectCategory(cat: string) {
    this.categoryChange.emit(cat);
  }
}
