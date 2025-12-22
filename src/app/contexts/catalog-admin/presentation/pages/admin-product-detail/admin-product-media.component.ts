import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-product-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-200">

      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Galería Multimedia</h3>
          <p class="text-xs text-gray-500 mt-1">La imagen "Portada" será la principal en la tienda.</p>
        </div>
        <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{{ images.length }} fotos</span>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div *ngFor="let img of images"
               class="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">

            <div class="aspect-square relative bg-gray-100">
              <img [src]="img.url" class="w-full h-full object-cover">

              <div *ngIf="img.primary" class="absolute top-0 left-0 right-0 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1.5 text-center shadow-sm tracking-widest border-b border-green-600">
                ★ PORTADA
              </div>
            </div>

            <div class="p-2 bg-white border-t border-gray-100 flex flex-col gap-2">

              <button *ngIf="!img.primary"
                      (click)="onSetPrimary.emit(img.id)"
                      class="w-full text-[10px] bg-white border border-gray-300 text-gray-700 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors font-bold uppercase flex items-center justify-center gap-1">
                <span>★</span> Hacer Portada
              </button>

              <div *ngIf="img.primary" class="w-full text-[10px] text-center text-green-700 font-bold py-1.5 bg-green-50 rounded border border-green-100 uppercase">
                ✓ Seleccionada
              </div>

              <button (click)="onDelete.emit(img.id)"
                      class="w-full text-[10px] bg-white border border-transparent text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors font-medium flex items-center justify-center gap-1">
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="images.length === 0" class="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mb-6">
          <div class="text-3xl mb-2 opacity-50">📷</div>
          <p class="text-xs text-gray-500">No hay imágenes. Sube la primera.</p>
        </div>

        <div class="bg-gray-50 rounded p-3 border border-gray-200">
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2">Agregar por URL</label>
          <div class="flex gap-2">
            <input [(ngModel)]="newUrl"
                   (keyup.enter)="upload()"
                   class="flex-1 text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                   placeholder="https://...">

            <button (click)="upload()"
                    [disabled]="!newUrl"
                    class="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              Subir
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProductMediaComponent {
  @Input() images: any[] = [];
  @Output() onUpload = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onSetPrimary = new EventEmitter<number>();

  newUrl = '';

  upload() {
    if(this.newUrl && this.newUrl.trim()) {
      this.onUpload.emit(this.newUrl.trim());
      this.newUrl = '';
    }
  }
}
