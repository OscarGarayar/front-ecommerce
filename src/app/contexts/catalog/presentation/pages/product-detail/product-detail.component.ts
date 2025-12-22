import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpCatalogRepository } from '../../../data/repositories/http-catalog.repository';
import { Product, ProductVariant } from '../../../domain/model/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white font-sans pb-20">

      <nav class="border-b px-6 py-4 flex items-center gap-4 sticky top-0 bg-white z-50">
        <a routerLink="/shop" class="text-gray-500 hover:text-gray-900">← Volver al catálogo</a>
      </nav>

      <div *ngIf="loading" class="p-10 text-center text-gray-500">Cargando detalle...</div>

      <div *ngIf="!loading && product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">

          <div class="flex flex-col-reverse">
            <div class="mt-6 w-full max-w-2xl mx-auto block lg:max-w-none">
              <div class="grid grid-cols-4 gap-6">
                <button *ngFor="let img of product.images"
                        (click)="selectedImage = img.url"
                        class="relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50 border border-gray-200">
                  <img [src]="img.url" class="w-full h-full object-center object-cover rounded-md">
                </button>
              </div>
            </div>

            <div class="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100 shadow-lg h-96">
              <img [src]="selectedImage || 'assets/placeholder.png'"
                   class="w-full h-full object-center object-cover">
            </div>
          </div>

          <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ product.name }}</h1>

            <div class="mt-3">
              <h2 class="sr-only">Información</h2>
              <p class="text-3xl text-gray-900">
                 S/ {{ product.price ?? '0.00' }}
              </p>
            </div>

            <div class="mt-6">
              <h3 class="sr-only">Descripción</h3>
              <div class="text-base text-gray-700 space-y-6" [innerHTML]="product.description"></div>
            </div>

            <div class="mt-6 border-t border-gray-200 pt-6">

              <div *ngIf="product.variants.length > 0">
                <h3 class="text-sm font-medium text-gray-900">Opciones Disponibles</h3>
                <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div *ngFor="let v of product.variants"
                       (click)="selectVariant(v)"
                       [class.ring-2]="selectedVariant === v"
                       [class.ring-indigo-500]="selectedVariant === v"
                       class="relative block border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 focus:outline-none">

                    <p class="text-base font-medium text-gray-900">
                      {{ getVariantLabel(v) }}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">{{ v.sku }}</p>
                    <div *ngIf="v.status === 'DRAFT'" class="absolute top-2 right-2 text-xs text-amber-600 font-bold">
                       Borrador
                    </div>
                  </div>

                </div>
              </div>

              <div *ngIf="product.variants.length === 0" class="mt-4 text-sm text-gray-500 italic">
                Producto único (sin variantes).
              </div>

              <div class="mt-10 flex gap-4">
                <button (click)="addToCart()"
                  [disabled]="product.variants.length > 0 && !selectedVariant"
                  class="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
                  {{ (product.variants.length > 0 && !selectedVariant) ? 'Selecciona una opción' : 'Agregar al carrito' }}
                </button>
              </div>

              <p class="mt-4 text-xs text-gray-400 text-center">
                Simulación de pedido. Stock sujeto a disponibilidad.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  selectedImage: string | null = null;
  selectedVariant: ProductVariant | null = null;

  constructor(
    private route: ActivatedRoute,
    private catalog: HttpCatalogRepository
  ) {}

  ngOnInit() {
    // Obtenemos el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    // AQUÍ usamos el endpoint ANTIGUO (byId) porque ese sí trae las variantes completas
    this.catalog.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        // Seleccionamos la primera imagen por defecto
        if (p.images && p.images.length > 0) {
          this.selectedImage = p.images[0].url;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectVariant(v: ProductVariant) {
    this.selectedVariant = v;
    // Si la variante tiene imágenes específicas, podríamos actualizar la principal aquí
    // if (v.images?.length) this.selectedImage = v.images[0].url;
  }

  getVariantLabel(v: ProductVariant): string {
    // Intenta formatear los atributos (ej. "Talla: M, Color: Rojo")
    if (v.attributes) {
      return Object.entries(v.attributes)
        .map(([key, val]) => `${key}: ${val}`)
        .join(' · ') || 'Variante Estándar';
    }
    return 'Opción ' + v.id;
  }

  addToCart() {
    if (!this.product) return;

    const itemToAdd = {
      productId: this.product.id,
      productName: this.product.name,
      variantId: this.selectedVariant?.id,
      price: this.product.price,
      sku: this.selectedVariant?.sku
    };

    console.log('🛒 Agregando al carrito:', itemToAdd);
    alert('Producto agregado al carrito (Simulación)');
  }
}
