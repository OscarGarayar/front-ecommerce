import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SessionStore} from "../../../../../core/state/session.store";
import {HttpAuthRepository} from "../../../data/repositories/http-auth.repository";

export type AuthMode = 'LOGIN' | 'SIGNUP';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">

        <div (click)="close()" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">

          <button (click)="close()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-10">✕</button>

          <div class="bg-gray-50 px-4 py-5 sm:px-6 border-b border-gray-100">
            <div class="flex justify-center space-x-6">
              <button (click)="switchMode('LOGIN')"
                      [class.text-indigo-600]="mode === 'LOGIN'"
                      [class.border-indigo-600]="mode === 'LOGIN'"
                      class="pb-2 text-sm font-bold uppercase tracking-wider text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">
                Iniciar Sesión
              </button>
              <button (click)="switchMode('SIGNUP')"
                      [class.text-indigo-600]="mode === 'SIGNUP'"
                      [class.border-indigo-600]="mode === 'SIGNUP'"
                      class="pb-2 text-sm font-bold uppercase tracking-wider text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">
                Crear Cuenta
              </button>
            </div>
          </div>

          <div class="px-4 py-5 sm:p-6">

            <form *ngIf="mode === 'LOGIN'" (ngSubmit)="login()" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email o Usuario</label>
                <input [(ngModel)]="identifier" name="identifier" type="text" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
                <input [(ngModel)]="password" name="password" type="password" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border">
              </div>
              <div class="pt-2">
                <button type="submit" [disabled]="loading" class="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                  {{ loading ? 'Entrando...' : 'Entrar' }}
                </button>
              </div>
            </form>

            <form *ngIf="mode === 'SIGNUP'" (ngSubmit)="signup()" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Usuario</label>
                <input [(ngModel)]="username" name="username" type="text" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input [(ngModel)]="email" name="email" type="email" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
                <input [(ngModel)]="password" name="password" type="password" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border">
              </div>
              <div class="pt-2">
                <button type="submit" [disabled]="loading" class="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50">
                  {{ loading ? 'Creando...' : 'Registrarme' }}
                </button>
              </div>
            </form>

            <div *ngIf="error" class="mt-4 p-2 text-xs text-red-600 bg-red-50 rounded border border-red-100 flex items-center">
              <span class="mr-2">⚠️</span> {{ error }}
            </div>
            <div *ngIf="message" class="mt-4 p-2 text-xs text-green-600 bg-green-50 rounded border border-green-100 flex items-center">
              <span class="mr-2">✅</span> {{ message }}
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class AuthModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  // Nuevo Input para controlar qué pestaña se muestra al abrir
  @Input() set initialMode(val: AuthMode) {
    this.mode = val;
    this.error = '';
    this.message = '';
  }

  mode: AuthMode = 'LOGIN';
  loading = false;
  error = '';
  message = '';

  identifier = ''; username = ''; email = ''; password = '';

  constructor(private authRepo: HttpAuthRepository, private session: SessionStore) {}

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  switchMode(m: AuthMode) {
    this.mode = m;
    this.error = '';
    this.message = '';
  }

  login() {
    this.loading = true; this.error = '';
    this.authRepo.signIn({ identifier: this.identifier, password: this.password }).subscribe({
      next: () => { this.loading = false; this.close(); },
      error: () => { this.loading = false; this.error = 'Credenciales incorrectas.'; }
    });
  }

  signup() {
    this.loading = true; this.error = '';
    this.authRepo.signUp({ username: this.username, email: this.email, password: this.password, role: 'ROLE_USER' }).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Cuenta creada. Iniciando sesión...';
        this.identifier = this.email;
        setTimeout(() => this.login(), 1000);
      },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Error al crear cuenta.'; }
    });
  }
}
