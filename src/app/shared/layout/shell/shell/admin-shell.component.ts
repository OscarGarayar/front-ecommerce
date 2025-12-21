import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen">
      <header class="border-b p-4 flex items-center justify-between">
        <div class="font-semibold">Admin Panel</div>

        <nav class="flex gap-4 text-sm">
          <a class="underline" routerLink="/admin/catalog/products">Products</a>
          <a class="underline" routerLink="/admin/catalog/categories">Categories</a>
          <a class="underline" routerLink="/shop">Storefront</a>
        </nav>
      </header>

      <main class="p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminShellComponent {}
