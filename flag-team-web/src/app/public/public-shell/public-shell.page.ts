
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  imports: [RouterLink, RouterOutlet],
  template: `
      <header class="bg-white border-b">
      <div class="max-w-6xl mx-auto p-3 flex items-center gap-4">
      <a routerLink="/" class="font-semibold">Sky Runners</a>
      <a routerLink="/jugadores" class="hover:underline">Jugadores</a>
      <a routerLink="/eventos" class="hover:underline">Eventos</a>
      <a routerLink="/patrocinadores" class="hover:underline">Patrocinadores</a>
      <a routerLink="/calendario" class="hover:underline">Calendario</a>
      <a routerLink="/reglamentos" class="hover:underline">Reglamentos</a>
      <a routerLink="/inscripcion" class="hover:underline">Inscripción</a>
      <a class="ml-auto btn" routerLink="/login">Admin</a>
      </div>
      </header>
      <main class="max-w-6xl mx-auto p-4 md:p-6">
      <router-outlet />
      </main>
    `,
  styles: ``
})
export class PublicShellPage { }
