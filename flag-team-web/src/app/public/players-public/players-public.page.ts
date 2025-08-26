
import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-players-public',
  imports: [],
  template: `
<div class="card">
  <h2 class="font-semibold mb-3">Jugadores</h2>
  <div class="grid md:grid-cols-3 gap-3">
    @for (p of players(); track p) {
      <div class="border rounded-xl p-3">
        <div class="font-medium">#{{p.jersey_number || '—'}} {{p.first_name}} {{p.last_name}}</div>
        <div class="text-xs text-gray-600">{{p.gender}} · {{p.position || '—'}}</div>
      </div>
    }
  </div>
</div>
`,
  styles: ``
})
export class PlayersPublicPage {
  private api = inject(Api);
  players = signal<any[]>([]);
  constructor() { this.api.get<any[]>('/api/public/players').subscribe(r => this.players.set(r)); }
}
