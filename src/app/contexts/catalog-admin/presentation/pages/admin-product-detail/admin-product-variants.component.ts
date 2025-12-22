import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpCatalogAdminRepository } from '../../../data/repositories/http-catalog-admin.repository';
import { AdminVariant } from '../../../domain/model/variant-admin';

// Interface para el Wizard de Creación
interface BulkVariantDraft {
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  selected: boolean;
}

@Component({
  selector: 'app-admin-product-variants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900">Gestión de Inventario</h3>
        <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{{ variants.length }} Variantes</span>
      </div>

      <div *ngIf="isLocked" class="bg-amber-50 border-l-4 border-amber-400 p-4 m-4">
        <div class="flex">
          <div class="flex-shrink-0 text-amber-400">⚠️</div>
          <div class="ml-3">
            <p class="text-sm text-amber-700 font-medium">
              Producto PUBLICADO.
              <span class="font-normal">Solo se permite editar Precios, Stock y Estado. Para crear/borrar variantes, pásalo a Borrador.</span>
            </p>
          </div>
        </div>
      </div>

      <details class="group border-b border-gray-200" [open]="variants.length === 0">
        <summary class="flex items-center justify-between px-6 py-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
          <span class="text-sm font-bold text-blue-800 uppercase tracking-wider">
            ✨ Creador Masivo de Variantes
          </span>
          <span class="text-blue-600 text-xs transform group-open:rotate-180 transition-transform">▼</span>
        </summary>

        <div class="p-6 bg-blue-50/50" [class.opacity-50]="isLocked">
          <fieldset [disabled]="isLocked">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">SKU Base</label>
                <input [(ngModel)]="baseSku" class="w-full border-gray-300 rounded p-2 text-sm uppercase font-mono" placeholder="Ej. PTL">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Precio Base</label>
                <input type="number" [(ngModel)]="basePrice" class="w-full border-gray-300 rounded p-2 text-sm">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Tallas</label>
                <div class="flex flex-wrap gap-2">
                  <label *ngFor="let s of predefinedSizes" class="cursor-pointer select-none">
                    <input type="checkbox" [checked]="selectedSizes.has(s)" (change)="toggleSize(s)" class="peer hidden">
                    <span class="inline-block px-3 py-1 bg-white border border-gray-300 rounded text-sm peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all hover:border-blue-400">
                      {{ s }}
                    </span>
                  </label>
                  <input [(ngModel)]="customSize" (keyup.enter)="addCustomSize()" class="w-12 border rounded p-1 text-xs text-center focus:ring-blue-500" placeholder="+">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Colores</label>
                <div class="flex flex-wrap gap-2">
                  <label *ngFor="let c of predefinedColors" class="cursor-pointer select-none">
                    <input type="checkbox" [checked]="selectedColors.has(c)" (change)="toggleColor(c)" class="peer hidden">
                    <span class="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded text-sm peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 transition-all hover:border-green-400">
                      <span class="w-2 h-2 rounded-full mr-2 border border-gray-200" [style.background-color]="getColorHex(c)"></span>
                      {{ c }}
                    </span>
                  </label>
                  <input [(ngModel)]="customColor" (keyup.enter)="addCustomColor()" class="w-12 border rounded p-1 text-xs text-center focus:ring-green-500" placeholder="+">
                </div>
              </div>
            </div>

            <div class="flex justify-end mb-4">
              <button (click)="generatePreview()"
                      [disabled]="!baseSku || selectedSizes.size === 0 || selectedColors.size === 0"
                      class="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-wide">
                Generar Pre-lista
              </button>
            </div>

            <div *ngIf="bulkList.length > 0" class="border border-gray-200 rounded overflow-hidden bg-white mb-2 shadow-sm">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">
                      <input type="checkbox" (change)="toggleAllBulk($event)" [checked]="isAllBulkSelected">
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">SKU</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Attrs</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Precio</th>
                    <th class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Stock Ini.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let item of bulkList" [class.bg-blue-50]="item.selected">
                    <td class="px-3 py-1"><input type="checkbox" [(ngModel)]="item.selected"></td>
                    <td class="px-3 py-1"><input [(ngModel)]="item.sku" class="w-full text-xs border-transparent bg-transparent focus:bg-white focus:border-gray-300 rounded font-mono"></td>
                    <td class="px-3 py-1 text-xs text-gray-600">{{ item.size }} / {{ item.color }}</td>
                    <td class="px-3 py-1"><input type="number" [(ngModel)]="item.price" class="w-20 text-xs border border-gray-200 rounded p-1"></td>
                    <td class="px-3 py-1"><input type="number" [(ngModel)]="item.stock" class="w-20 text-xs border border-gray-200 rounded p-1"></td>
                  </tr>
                </tbody>
              </table>
              <div class="p-3 bg-gray-50 border-t flex justify-between items-center">
                 <span class="text-xs text-gray-500">{{ bulkList.length }} variantes generadas.</span>
                 <button (click)="confirmBulkCreation()" [disabled]="isProcessing" class="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-green-700">
                   {{ isProcessing ? 'Creando...' : 'Confirmar Creación' }}
                 </button>
              </div>
            </div>
          </fieldset>
        </div>
      </details>

      <div class="p-6">

        <div class="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-4">

          <div class="flex items-center gap-2">
            <div class="relative">
              <select [(ngModel)]="filterSize" (change)="applyFilters()" class="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded bg-white focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todas las Tallas</option>
                <option *ngFor="let s of availableSizes" [value]="s">{{ s }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">▼</div>
            </div>

            <div class="relative">
              <select [(ngModel)]="filterColor" (change)="applyFilters()" class="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded bg-white focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos los Colores</option>
                <option *ngFor="let c of availableColors" [value]="c">{{ c }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">▼</div>
            </div>

            <button (click)="loadAllDetails()" class="text-xs text-indigo-600 hover:text-indigo-800 underline ml-2" title="Refrescar datos de precio/stock">
              ↻ Actualizar Datos
            </button>
          </div>

          <div *ngIf="selectedRows.size > 0" class="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded border border-indigo-100 animate-fade-in">
            <span class="text-xs font-bold text-indigo-800">{{ selectedRows.size }} selec.</span>

            <div class="h-4 w-px bg-indigo-200 mx-1"></div>

            <input type="number" [(ngModel)]="bulkPriceInput" class="w-16 text-xs border-indigo-200 rounded p-1" placeholder="S/">
            <button (click)="bulkUpdatePrice()" [disabled]="!bulkPriceInput" class="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50">Fijar Precio</button>

            <div class="relative group">
                <button class="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50">📷 Foto</button>
                <div class="absolute right-0 bottom-full mb-2 w-64 bg-white shadow-lg rounded p-2 border border-gray-200 hidden group-hover:block z-10">
                   <input [(ngModel)]="bulkImgInput" class="w-full text-xs border border-gray-300 rounded p-1 mb-1" placeholder="Pegar URL imagen">
                   <button (click)="bulkUpdateImage()" class="w-full bg-indigo-600 text-white text-xs py-1 rounded">Aplicar a Seleccionados</button>
                </div>
             </div>

            <div class="h-4 w-px bg-indigo-200 mx-1"></div>

            <button (click)="bulkToggleActive(true)" class="text-green-600 hover:bg-green-100 p-1 rounded" title="Activar Seleccionados">✓</button>
            <button (click)="bulkToggleActive(false)" class="text-amber-600 hover:bg-amber-100 p-1 rounded" title="Desactivar Seleccionados">✕</button>
            <button (click)="bulkDelete()" [disabled]="isLocked" class="text-red-600 hover:bg-red-100 p-1 rounded disabled:opacity-30" title="Eliminar Seleccionados">🗑</button>
          </div>
        </div>

        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left w-10">
                  <input type="checkbox" (change)="toggleAllRows($event)" [checked]="isAllRowsSelected" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                </th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Img</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle Variante</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Precio (S/)</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Stock</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Activo</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let v of filteredVariants" [class.bg-indigo-50]="selectedRows.has(v.id)" class="hover:bg-gray-50 transition-colors group">

                <td class="px-4 py-3 align-middle">
                  <input type="checkbox" [checked]="selectedRows.has(v.id)" (change)="toggleRow(v.id)" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                </td>

                <td class="px-4 py-3 align-middle">
                  <div class="relative group/img w-10 h-10">
                    <img [src]="getVariantImage(v)" class="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-50" alt="Var">
                    <div class="absolute inset-0 bg-black/50 hidden group-hover/img:flex items-center justify-center rounded cursor-pointer" (click)="openImgPrompt(v.id)">
                      <span class="text-white text-xs">✎</span>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 align-middle">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900 font-mono">{{ v.sku }}</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                       <span *ngFor="let attr of (v.attributes ?? {}) | keyvalue"
                             class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                         {{ attr.value }}
                       </span>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 align-middle">
                  <div class="relative">
                     <input type="number"
                            [ngModel]="pricingData[v.id]?.basePrice"
                            (blur)="updateRowPrice(v.id, $event)"
                            (keyup.enter)="$any($event.target).blur()"
                            class="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 px-2 text-right"
                            placeholder="...">
                     <div *ngIf="!pricingData[v.id]" class="absolute inset-0 flex items-center justify-center bg-gray-50/80 text-xs text-gray-400">...</div>
                  </div>
                </td>

                <td class="px-4 py-3 align-middle">
                  <div class="relative">
                    <input type="number"
                           [ngModel]="inventoryData[v.id]?.quantityOnHand"
                           (blur)="updateRowStock(v.id, $event)"
                           (keyup.enter)="$any($event.target).blur()"
                           class="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 px-2 text-right"
                           [class.text-red-600]="(inventoryData[v.id]?.quantityOnHand || 0) <= 0"
                           placeholder="...">
                     <div *ngIf="!inventoryData[v.id]" class="absolute inset-0 flex items-center justify-center bg-gray-50/80 text-xs text-gray-400">...</div>
                  </div>
                </td>

                <td class="px-4 py-3 align-middle text-center">
                  <button (click)="toggleRowActive(v.id, pricingData[v.id]?.active)"
                          [disabled]="!pricingData[v.id]"
                          class="relative inline-flex flex-shrink-0 h-5 w-9 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                          [class.bg-green-500]="pricingData[v.id]?.active"
                          [class.bg-gray-200]="!pricingData[v.id]?.active">
                    <span aria-hidden="true"
                          class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                          [class.translate-x-4]="pricingData[v.id]?.active"
                          [class.translate-x-0]="!pricingData[v.id]?.active">
                    </span>
                  </button>
                </td>

                <td class="px-4 py-3 align-middle text-right">
                  <button (click)="onDelete.emit(v.id)"
                          [disabled]="isLocked"
                          class="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-0"
                          title="Eliminar variante">
                    🗑
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredVariants.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 italic">
                  No se encontraron variantes con los filtros actuales.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Animación simple para la barra de acciones */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class AdminProductVariantsComponent implements OnChanges {
  @Input() variants: AdminVariant[] = [];
  @Input() productId!: number;
  @Input() productStatus: string = '';

  @Output() onCreate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onRefresh = new EventEmitter<void>();

  // --- WIZARD STATES ---
  baseSku = ''; basePrice = 0;
  predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'U'];
  predefinedColors = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Beige', 'Gris'];
  selectedSizes = new Set<string>(); selectedColors = new Set<string>();
  customSize = ''; customColor = '';
  bulkList: BulkVariantDraft[] = [];
  isProcessing = false;

  // --- MANAGEMENT TABLE STATES ---
  filteredVariants: AdminVariant[] = [];
  selectedRows = new Set<number>();

  // Filtros
  filterSize = ''; filterColor = '';
  availableSizes: string[] = []; availableColors: string[] = [];

  // Bulk Tools Inputs
  bulkPriceInput: number | null = null;
  bulkImgInput: string = '';

  // Cache Data (Maps ID -> Data)
  pricingData: Record<number, any> = {};
  inventoryData: Record<number, any> = {};

  constructor(private repo: HttpCatalogAdminRepository) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['variants']) {
      this.extractFilterOptions();
      this.applyFilters();
      // Si llegan variantes nuevas, cargamos sus detalles
      this.loadAllDetails();
    }
  }

  get isLocked(): boolean { return this.productStatus === 'PUBLISHED'; }
  get isAllBulkSelected(): boolean { return this.bulkList.length > 0 && this.bulkList.every(i => i.selected); }
  get isAllRowsSelected(): boolean { return this.filteredVariants.length > 0 && this.selectedRows.size === this.filteredVariants.length; }

  // =========================================================
  //  1. GESTIÓN DE DATOS Y FILTROS
  // =========================================================

  extractFilterOptions() {
    const sizes = new Set<string>();
    const colors = new Set<string>();

    this.variants.forEach(v => {
      const attrs = v.attributes ?? {};
      if (attrs['Size']) sizes.add(attrs['Size']);
      if (attrs['Color']) colors.add(attrs['Color']);
    });

    this.availableSizes = Array.from(sizes).sort();
    this.availableColors = Array.from(colors).sort();
  }

  applyFilters() {
    this.filteredVariants = this.variants.filter(v => {
      const attrs = v.attributes ?? {};
      const matchSize = !this.filterSize || attrs['Size'] === this.filterSize;
      const matchColor = !this.filterColor || attrs['Color'] === this.filterColor;
      return matchSize && matchColor;
    });
    this.selectedRows.clear(); // Limpiar selección al filtrar para evitar errores
  }

  loadAllDetails() {
    // Carga precio y stock para TODAS las variantes visibles (para evitar N llamadas individuales si son muchas, idealmente el backend daría esto en lista, pero usamos lo que tenemos)
    this.variants.forEach(v => {
      if(!this.pricingData[v.id]) {
        this.repo.getPrice(v.id).subscribe(res => this.pricingData[v.id] = res);
      }
      if(!this.inventoryData[v.id]) {
        this.repo.getInventory(v.id).subscribe(res => this.inventoryData[v.id] = res);
      }
    });
  }

  // =========================================================
  //  2. WIZARD CREACIÓN MASIVA
  // =========================================================
  toggleSize(s: string) { this.selectedSizes.has(s) ? this.selectedSizes.delete(s) : this.selectedSizes.add(s); }
  toggleColor(c: string) { this.selectedColors.has(c) ? this.selectedColors.delete(c) : this.selectedColors.add(c); }

  addCustomSize() { if(this.customSize){ this.selectedSizes.add(this.customSize); this.predefinedSizes.push(this.customSize); this.customSize=''; } }
  addCustomColor() { if(this.customColor){ this.selectedColors.add(this.customColor); this.predefinedColors.push(this.customColor); this.customColor=''; } }

  generatePreview() {
    this.bulkList = [];
    this.selectedSizes.forEach(size => {
      this.selectedColors.forEach(color => {
        const sku = `${this.baseSku.toUpperCase()}-${size.toUpperCase().slice(0,2)}-${color.toUpperCase().slice(0,3)}`;
        this.bulkList.push({ sku, size, color, price: this.basePrice, stock: 0, selected: true });
      });
    });
  }

  toggleAllBulk(e: any) { this.bulkList.forEach(i => i.selected = e.target.checked); }

  async confirmBulkCreation() {
    if(this.isLocked) return;
    this.isProcessing = true;
    const toCreate = this.bulkList.filter(i => i.selected);

    for (const item of toCreate) {
      try {
        const payload = { sku: item.sku, attributes: { 'Size': item.size, 'Color': item.color }, price: Number(item.price) };
        const v = await this.repo.createVariant(this.productId, payload).toPromise();

        // Asumiendo que el back devuelve el objeto creado o su ID. Si es void, no podemos setear stock inmediatamente.
        // Ajusta esto según tu respuesta real del back.
        if (v && v.id && item.stock > 0) {
          await this.repo.increaseStock(v.id, item.stock).toPromise();
        }
      } catch (e) { console.error(e); }
    }

    this.isProcessing = false;
    this.bulkList = []; this.selectedSizes.clear(); this.selectedColors.clear();
    this.onRefresh.emit();
  }

  // =========================================================
  //  3. ACCIONES DE TABLA (EDICIÓN INLINE)
  // =========================================================

  toggleAllRows(e: any) {
    if (e.target.checked) {
      this.filteredVariants.forEach(v => this.selectedRows.add(v.id));
    } else {
      this.selectedRows.clear();
    }
  }

  toggleRow(id: number) {
    this.selectedRows.has(id) ? this.selectedRows.delete(id) : this.selectedRows.add(id);
  }

  // --- Update Price Inline ---
  updateRowPrice(id: number, event: any) {
    const newVal = Number(event.target.value);
    const oldVal = this.pricingData[id]?.basePrice;
    if (newVal === oldVal || newVal < 0) return;

    this.repo.updatePrice(id, newVal).subscribe({
      next: () => this.refreshRow(id), // Recarga dato fresco
      error: () => event.target.value = oldVal // Revertir en error
    });
  }

  // --- Update Stock Inline (Calcula delta) ---
  updateRowStock(id: number, event: any) {
    const newVal = Number(event.target.value);
    const current = this.inventoryData[id]?.quantityOnHand || 0;
    if (newVal === current || newVal < 0) return;

    const diff = newVal - current;
    const action$ = diff > 0
      ? this.repo.increaseStock(id, diff)
      : this.repo.decreaseStock(id, Math.abs(diff));

    action$.subscribe({
      next: () => this.refreshRow(id),
      error: () => event.target.value = current
    });
  }

  // --- Update Status Inline ---
  toggleRowActive(id: number, currentStatus: boolean) {
    const action$ = currentStatus
      ? this.repo.deactivatePrice(id)
      : this.repo.activatePrice(id);

    action$.subscribe(() => this.refreshRow(id));
  }

  // --- Image Handling ---
  getVariantImage(v: AdminVariant): string {
    return (v.images && v.images.length > 0) ? v.images[0].url : 'assets/placeholder-variant.png';
    // O usa un placeholder online si no tienes assets locales
  }

  openImgPrompt(id: number) {
    if(this.isLocked) return;
    const url = prompt("Ingresa URL de la imagen:");
    if(url) {
      this.repo.addVariantImage(this.productId, id, { url, type: 'GALLERY' }).subscribe(() => {
        this.onRefresh.emit();
      });
    }
  }

  // Helper para recargar solo una fila
  refreshRow(id: number) {
    this.repo.getPrice(id).subscribe(res => this.pricingData[id] = res);
    this.repo.getInventory(id).subscribe(res => this.inventoryData[id] = res);
  }

  // =========================================================
  //  4. ACCIONES MASIVAS
  // =========================================================

  bulkUpdatePrice() {
    if (!this.bulkPriceInput) return;
    this.selectedRows.forEach(id => {
      this.repo.updatePrice(id, Number(this.bulkPriceInput)).subscribe(() => this.refreshRow(id));
    });
  }

  bulkToggleActive(activate: boolean) {
    this.selectedRows.forEach(id => {
      const action$ = activate ? this.repo.activatePrice(id) : this.repo.deactivatePrice(id);
      action$.subscribe(() => this.refreshRow(id));
    });
  }

  bulkUpdateImage() {
    if (!this.bulkImgInput || this.isLocked) return;
    // Ojo: Esto añadirá la imagen a todas. Si ya tienen, tendrán 2.
    this.selectedRows.forEach(id => {
      this.repo.addVariantImage(this.productId, id, { url: this.bulkImgInput, type: 'GALLERY' }).subscribe();
    });
    // Timeout breve para refrescar UI global
    setTimeout(() => this.onRefresh.emit(), 1000);
  }

  bulkDelete() {
    if(this.isLocked || !confirm(`¿Eliminar ${this.selectedRows.size} variantes?`)) return;

    // Convertir a array para procesar
    const ids = Array.from(this.selectedRows);
    let completed = 0;

    ids.forEach(id => {
      this.repo.deleteVariant(this.productId, id).subscribe(() => {
        completed++;
        if(completed === ids.length) {
          this.selectedRows.clear();
          this.onRefresh.emit();
        }
      });
    });
  }

  getColorHex(name: string): string {
    const map: any = { 'Negro': '#111', 'Blanco': '#fff', 'Rojo': '#ef4444', 'Azul': '#3b82f6', 'Verde': '#22c55e', 'Beige': '#f5f5dc', 'Gris': '#9ca3af' };
    return map[name] || '#eee';
  }
}
