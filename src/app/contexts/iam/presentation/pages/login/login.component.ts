import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpAuthRepository } from '../../../data/repositories/http-auth.repository';
import { RoleUtils } from '../../../domain/model/role';
import { SessionStore } from '../../../../../core/state/session.store';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="w-full max-w-md border rounded-xl p-6">
        <h1 class="text-xl font-bold">Login</h1>

        <form class="mt-4 space-y-3" (ngSubmit)="submit()">
          <div>
            <label class="block text-sm">Email</label>
            <input class="w-full border p-2 rounded" [(ngModel)]="email" name="email"/>
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
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authRepo: HttpAuthRepository,
    private router: Router,
    private session: SessionStore
  ) {}

  submit() {
    this.error = '';
    this.authRepo.signIn({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const role = this.session.snapshot.role;
        this.router.navigateByUrl(RoleUtils.isAdmin(role) ? '/admin' : '/shop');
      },
      error: (err) => {
        this.error = `Login falló.\n${err?.error?.message ?? err?.message ?? 'Error desconocido'}`;
      }
    });
  }
}
