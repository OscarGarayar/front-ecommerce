import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpAuthRepository } from '../../../data/repositories/http-auth.repository';
import { SessionStore } from '../../../../../core/state/session.store';
import { RolePolicy } from '../../../domain/model/role';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Bienvenido de nuevo
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          ¿Aún no eres cliente?
          <a href="/customer/signup" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Crea una cuenta gratis
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" (ngSubmit)="submit()">

            <div>
              <label for="identifier" class="block text-sm font-medium text-gray-700">Usuario o Email</label>
              <div class="mt-1">
                <input id="identifier" name="identifier" type="text" required
                       [(ngModel)]="identifier"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" required
                       [(ngModel)]="password"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Entrar
              </button>
            </div>
          </form>

          <div *ngIf="error" class="mt-4 p-2 rounded bg-red-50 text-red-700 text-sm border border-red-200 whitespace-pre-wrap">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerLoginComponent {
  identifier = '';
  password = '';
  error = '';

  constructor(
    private authRepo: HttpAuthRepository,
    private router: Router,
    private session: SessionStore
  ) {}

  submit() {
    this.error = '';

    this.authRepo.signIn({ identifier: this.identifier, password: this.password }).subscribe({
      next: () => {
        const role = this.session.snapshot.role;

        if (!RolePolicy.isAllowedForCustomerArea(role)) {
          this.authRepo.logout();
          this.error = 'Acceso denegado: esta página es solo para clientes.';
          return;
        }

        this.router.navigateByUrl('/shop');
      },
      error: (err) => {
        if (err?.status === 404 || err?.status === 401) {
          this.error = 'Credenciales inválidas.';
          return;
        }
        this.error = `Login falló.\n${err?.error?.message ?? err?.message ?? 'Error desconocido'}`;
      }
    });
  }
}
