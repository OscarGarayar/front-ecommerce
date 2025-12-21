import { Routes } from '@angular/router';
import { authGuard } from '../../contexts/iam/presentation/guards/auth.guard';
import { adminGuard } from '../../contexts/iam/presentation/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'shop' },

  {
    path: 'shop',
    loadComponent: () =>
      import('../../contexts/catalog/presentation/pages/shop-home/shop-home.component')
        .then(m => m.ShopHomeComponent),
  },

  // IAM CLIENTE (público)
  {
    path: 'customer',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('../../contexts/iam/presentation/pages/customer-login/customer-login.component')
            .then(m => m.CustomerLoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('../../contexts/iam/presentation/pages/customer-signup/customer-signup.component')
            .then(m => m.CustomerSignupComponent),
      },
    ],
  },

  // IAM ADMIN (no se muestra en UI pública)
  {
    path: 'admin/auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('../../contexts/iam/presentation/pages/admin-login/admin-login.component')
            .then(m => m.AdminLoginComponent),
      },
    ],
  },

  // Admin App (protegido)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../../shared/layout/shell/shell/admin-shell.component')
        .then(m => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'catalog/products' },

      {
        path: 'catalog/categories',
        loadComponent: () =>
          import('../../contexts/catalog-admin/presentation/pages/admin-categories/admin-categories.component')
            .then(m => m.AdminCategoriesComponent),
      },

      // LISTA: Draft bucket + Published
      {
        path: 'catalog/products',
        loadComponent: () =>
          import('../../contexts/catalog-admin/presentation/pages/admin-products/admin-products.component')
            .then(m => m.AdminProductsComponent),
      },

      // DETALLE/EDICIÓN
      {
        path: 'catalog/products/:id',
        loadComponent: () =>
          import('../../contexts/catalog-admin/presentation/pages/admin-product-detail/admin-product-detail.component')
            .then(m => m.AdminProductDetailComponent),
      },
    ],
  },



  { path: '**', redirectTo: 'shop' },
];
