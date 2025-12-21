import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpAuthRepository } from '../../../data/repositories/http-auth.repository';
import { SessionStore } from '../../../../../core/state/session.store';
import { RolePolicy } from '../../../domain/model/role';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-md border rounded-xl p-6">
        <h1 class="text-xl font-bold">Login (Admin)</h1>

        <form class="mt-4 space-y-3" (ngSubmit)="submit()">
          <div>
            <label class="block text-sm">Usuario o Email</label>
            <input class="w-full border p-2 rounded" [(ngModel)]="identifier" name="identifier"/>
          </div>

          <div>
            <label class="block text-sm">Password</label>
            <input class="w-full border p-2 rounded" type="password"
                   [(ngModel)]="password" name="password"/>
          </div>

          <button class="w-full border px-4 py-2 rounded" type="submit">Entrar</button>

          <p class="text-sm mt-2" *ngIf="error" style="white-space: pre-wrap;">{{ error }}</p>
        </form>
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
