
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink],
  template: `
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <a routerLink="/app/dashboard" class="font-semibold">Sky Runners</a>
        <a routerLink="/app/players" class="hover:underline">Jugadores</a>
        <a routerLink="/app/events" class="hover:underline">Eventos</a>
        <a routerLink="/app/injuries" class="hover:underline">Lesiones</a>
        <a routerLink="/app/payments" class="hover:underline">Pagos</a>
        <a routerLink="/app/uploads" class="hover:underline">Subidas</a>
        <a routerLink="/app/sponsors" class="hover:underline">Patrocinadores</a>
        <a routerLink="/app/ads" class="hover:underline">Anuncios</a>
        <a routerLink="/app/regulations" class="hover:underline">Reglamentos</a>
        <a routerLink="/app/registrations" class="hover:underline">Inscripciones</a>
        <a routerLink="/app/guide" class="hover:underline">Guía</a>
        @if (user()) {
          <span class="ml-auto text-sm text-gray-600">{{user()?.email}} ({{user()?.role}})</span>
        }
        <button class="btn" (click)="logout()">Cerrar sesión</button>
      </div>
    </nav>
    <main class="max-w-6xl mx-auto p-4 md:p-6">
      <router-outlet />
    </main>
  </div>
  `,
  styles: ``
})
export class ShellPage {
  private auth = inject(Auth); private router = inject(Router);
  user = computed(()=>this.auth.user());
  logout(){ this.auth.logout(); this.router.navigateByUrl('/login'); }
}
