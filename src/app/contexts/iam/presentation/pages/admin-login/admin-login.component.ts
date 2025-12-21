import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpAuthRepository } from '../../../data/repositories/http-auth.repository';
import { SessionStore } from '../../../../../core/state/session.store';
import { RolePolicy } from '../../../domain/model/role';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-800">
          Portal Administrativo
        </h2>
        <p class="mt-2 text-center text-sm text-gray-500">
          Acceso restringido
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border-t-4 border-gray-600">
          <form class="space-y-6" (ngSubmit)="submit()">

            <div>
              <label for="identifier" class="block text-sm font-medium text-gray-700">Usuario o Email</label>
              <div class="mt-1">
                <input id="identifier" name="identifier" type="text" required
                  [(ngModel)]="identifier"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" required
                  [(ngModel)]="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                Ingresar al Dashboard
              </button>
            </div>
          </form>

          <div *ngIf="error" class="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm whitespace-pre-wrap flex items-center">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
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

        if (!RolePolicy.isAllowedForAdminArea(role)) {
          this.authRepo.logout();
          this.error = 'Acceso denegado: esta página es solo para administradores.';
          return;
        }

        this.router.navigateByUrl('/admin');
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
