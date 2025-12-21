import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpAuthRepository } from '../../../data/repositories/http-auth.repository';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-md border rounded-xl p-6">
        <h1 class="text-xl font-bold">Crear cuenta (Cliente)</h1>

        <form class="mt-4 space-y-3" (ngSubmit)="submit()">
          <div>
            <label class="block text-sm">Usuario</label>
            <input class="w-full border p-2 rounded" [(ngModel)]="username" name="username"/>
          </div>

          <div>
            <label class="block text-sm">Email</label>
            <input class="w-full border p-2 rounded" [(ngModel)]="email" name="email"/>
          </div>

          <div>
            <label class="block text-sm">Password</label>
            <input class="w-full border p-2 rounded" type="password"
                   [(ngModel)]="password" name="password"/>
          </div>

          <button class="w-full border px-4 py-2 rounded" type="submit">
            Crear cuenta
          </button>

          <p class="text-sm mt-3">
            ¿Ya tienes cuenta?
            <a class="underline" href="/customer/login">Iniciar sesión</a>
          </p>

          <p class="text-sm mt-2" *ngIf="message" style="white-space: pre-wrap;">{{ message }}</p>
          <p class="text-sm mt-2" *ngIf="error" style="white-space: pre-wrap;">{{ error }}</p>
        </form>
      </div>
    </div>
  `
})
export class CustomerSignupComponent {
  username = '';
  email = '';
  password = '';

  message = '';
  error = '';

  constructor(private authRepo: HttpAuthRepository, private router: Router) {}

  submit() {
    this.message = '';
    this.error = '';

    this.authRepo.signUp({
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'ROLE_USER',
    }).subscribe({
      next: () => {
        this.message = 'Cuenta creada. Ahora inicia sesión.';
        setTimeout(() => this.router.navigateByUrl('/customer/login'), 800);
      },
      error: (err) => {
        this.error = `Signup falló.\n${err?.error?.message ?? err?.message ?? 'Error desconocido'}`;
      }
    });
  }
}
