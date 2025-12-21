import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';

import {
  HttpCatalogAdminRepository,
  CategoryDto,
} from '../../../data/repositories/http-catalog-admin.repository';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, AsyncPipe],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <h1 class="text-2xl font-bold">Categorías</h1>

      <!-- Create Category -->
      <div class="border rounded-xl p-4 space-y-4">
        <h2 class="font-semibold">Crear categoría</h2>

        <div>
          <label class="block text-sm">Nombre</label>
          <input
            class="w-full border p-2 rounded"
            [(ngModel)]="name"
            placeholder="Ej. Ropa"
          />
        </div>

        <div>
          <label class="block text-sm">Descripción (opcional)</label>
          <input
            class="w-full border p-2 rounded"
            [(ngModel)]="description"
          />
        </div>

        <div>
          <label class="block text-sm">Categoría padre (opcional)</label>
          <select class="w-full border p-2 rounded" [(ngModel)]="parentId">
            <option [ngValue]="null">— Ninguna —</option>
            <option *ngFor="let c of categories" [ngValue]="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <button
          class="border px-4 py-2 rounded"
          (click)="createCategory()"
        >
          Crear
        </button>

        <p class="text-sm text-green-600" *ngIf="message">{{ message }}</p>
        <p class="text-sm text-red-600" *ngIf="error">{{ error }}</p>
      </div>

      <!-- Categories list -->
      <div class="border rounded-xl p-4">
        <h2 class="font-semibold mb-3">Listado</h2>

        <table class="w-full border-collapse">
          <thead>
          <tr class="border-b">
            <th class="text-left p-2">ID</th>
            <th class="text-left p-2">Nombre</th>
            <th class="text-left p-2">Parent</th>
          </tr>
          </thead>

          <tbody>
          <tr *ngFor="let c of categories" class="border-b">
            <td class="p-2">{{ c.id }}</td>
            <td class="p-2">{{ c.name }}</td>
            <td class="p-2">
              {{ getParentName(c.parentId) || '—' }}
            </td>
          </tr>

          <tr *ngIf="categories.length === 0">
            <td colspan="3" class="p-4 text-center text-gray-500">
              No hay categorías registradas.
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryDto[] = [];

  // form
  name = '';
  description = '';
  parentId: number | null = null;

  message = '';
  error = '';

  constructor(private repo: HttpCatalogAdminRepository) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.repo.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: () => (this.error = 'No se pudieron cargar las categorías'),
    });
  }

  createCategory() {
    this.message = '';
    this.error = '';

    if (!this.name.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    const payload: {
      name: string;
      description?: string;
      parentId?: number | null;
    } = {
      name: this.name.trim(),
    };

    if (this.description.trim()) payload.description = this.description.trim();
    if (this.parentId != null) payload.parentId = this.parentId;

    this.repo.createCategory(payload).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.parentId = null;
        this.message = 'Categoría creada correctamente';
        this.loadCategories();
      },
      error: (err) => {
        this.error =
          err?.error?.message ??
          'Error al crear la categoría';
      },
    });
  }

  getParentName(parentId?: number | null): string | undefined {
    if (!parentId) return undefined;
    return this.categories.find((c) => c.id === parentId)?.name;
  }
}
