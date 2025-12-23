import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, AsyncPipe, CommonModule } from '@angular/common';

import {
  HttpCatalogAdminRepository,
  CategoryDto,
} from '../../../data/repositories/http-catalog-admin.repository';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20 font-sans">

      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p class="mt-1 text-sm text-gray-500">Crea y organiza las categorías para clasificar tus productos.</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-6 border border-gray-100">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span class="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              </span>
              Nueva Categoría
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre *</label>
                <input type="text" [(ngModel)]="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Ej. Ropa de Hombre">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea rows="2" [(ngModel)]="description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Opcional..."></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Categoría Padre</label>
                <select [(ngModel)]="parentId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                  <option [ngValue]="null">-- Es categoría raíz --</option>
                  <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <button (click)="createCategory()" [disabled]="!name.trim()" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                Crear Categoría
              </button>

              <div *ngIf="message" class="p-2 rounded bg-green-50 text-green-700 text-sm border border-green-200 flex items-center gap-2 animate-pulse">
                ✓ {{ message }}
              </div>
              <div *ngIf="error" class="p-2 rounded bg-red-50 text-red-700 text-sm border border-red-200 whitespace-pre-wrap">
                ⚠ {{ error }}
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Listado Existente</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ categories.length }} registros
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jerarquía</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let c of categories" class="hover:bg-gray-50 transition-colors group">

                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <span class="text-xs font-mono text-gray-400 mr-2">#{{ c.id }}</span>
                      <div>
                        <div class="text-sm font-bold text-gray-900">{{ c.name }}</div>
                        <div class="text-xs text-gray-500">{{ c.description || '-' }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span *ngIf="getParentName(c.parentId) as pname" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        ↳ {{ pname }}
                      </span>
                    <span *ngIf="!c.parentId" class="text-gray-400 text-xs italic bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        Raíz
                      </span>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="deleteCategory(c)"
                            class="text-red-400 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                            title="Eliminar categoría">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>

                <tr *ngIf="categories.length === 0">
                  <td colspan="3" class="px-6 py-10 text-center text-sm text-gray-500">
                    No hay categorías registradas aún.
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryDto[] = [];

  // Form inputs
  name = '';
  description = '';
  parentId: number | null = null;

  // Feedback states
  message = '';
  error = '';

  constructor(private repo: HttpCatalogAdminRepository) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.repo.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: () => (this.error = 'No se pudieron cargar las categorías desde el servidor.'),
    });
  }

  createCategory() {
    this.message = '';
    this.error = '';

    if (!this.name.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    const payload = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      parentId: this.parentId,
    };

    this.repo.createCategory(payload).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.parentId = null;
        this.message = 'Categoría creada correctamente.';
        this.loadCategories();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Ocurrió un error al crear la categoría.';
      },
    });
  }

  // --- NUEVA FUNCIÓN DELETE ---
  deleteCategory(category: CategoryDto) {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?\n\nSi tiene productos asociados, no se podrá borrar.`)) {
      return;
    }

    this.message = '';
    this.error = '';

    this.repo.deleteCategory(category.id).subscribe({
      next: () => {
        this.message = 'Categoría eliminada correctamente.';
        this.loadCategories(); // Refrescar la tabla
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        // Aquí capturamos si el backend rechaza el borrado (ej. si está en uso)
        console.error(err);
        this.error = err?.error?.message || 'No se pudo eliminar la categoría. Verifique que no tenga productos o subcategorías asociadas.';
      }
    });
  }

  getParentName(parentId?: number | null): string | undefined {
    if (!parentId) return undefined;
    return this.categories.find((c) => c.id === parentId)?.name;
  }
}
