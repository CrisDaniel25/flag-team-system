import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
 <div class="min-h-screen grid place-items-center bg-gray-50">
   <div class="card w-full max-w-md">
     <h1 class="text-xl font-semibold mb-4">Iniciar sesión</h1>
     <div class="mb-4 rounded-xl border border-lime-300 bg-lime-50 p-3 text-sm text-gray-700">
       <strong>Portfolio demo</strong>
       <p>Los datos son ficticios y las operaciones de escritura están deshabilitadas.</p>
     </div>
     <form (ngSubmit)="submit()" class="grid gap-3">
       <input class="input" [(ngModel)]="email" name="email" type="email" placeholder="Correo electrónico" required />
       <input class="input" [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" required />
       <button class="btn btn-primary" [disabled]="loading">Entrar</button>
       @if (error) {
         <p class="text-sm text-red-600">{{error}}</p>
       }
     </form>
   </div>
 </div>
 `,
  styles: ``
})
export class LoginPage {
  private auth = inject(Auth); private router = inject(Router);
  email = 'demo@portfolio.local'; password = 'demo'; loading = false; error = '';
  submit() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => { this.auth.setSession(res.token, res.user); this.router.navigateByUrl('/app'); },
      error: (e) => { this.error = e?.error?.error || 'Login failed'; this.loading = false; }
    });
  }
}
