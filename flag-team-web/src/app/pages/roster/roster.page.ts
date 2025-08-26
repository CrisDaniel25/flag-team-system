
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../core/api';
import { Player, RosterEntry, RosterRole } from '../../model';

@Component({
  selector: 'app-roster',
  imports: [FormsModule],
  template: `
      <div class="card">
      <div class="flex items-center gap-3 mb-3">
      <h2 class="font-semibold">Planificador de Roster</h2>
      <div class="ml-auto text-sm">Límite: {{limit}} · Seleccionados: {{selectedCount()}}</div>
      <button class="btn btn-primary" (click)="save()">Guardar</button>
      </div>


      <div class="grid md:grid-cols-2 gap-4">
      <div>
      <h3 class="font-medium mb-2">Disponibles</h3>
      <input class="input mb-2" placeholder="Buscar nombre..." [(ngModel)]="search" />
      <div class="space-y-2 max-h-[60vh] overflow-auto">
      @for (p of filteredAvailable(); track p.id) {
      <div class="border rounded-xl p-2 flex items-center gap-2">
      <div class="text-sm grow">#{{p.jersey_number || '—'}} {{p.first_name}} {{p.last_name}}</div>
      <select class="select" [(ngModel)]="roleMap[p.id!]">
      <option value="starter">Titular</option>
      <option value="bench">Banca</option>
      <option value="inactive">Inactivo</option>
      </select>
      <input class="input w-32" placeholder="Pos" [(ngModel)]="posMap[p.id!]" />
      <button class="btn" (click)="add(p)">Añadir</button>
      </div>
      }
      </div>
      </div>
      <div>
      <h3 class="font-medium mb-2">Roster del partido</h3>
      <div class="space-y-2 max-h-[60vh] overflow-auto">
      @for (r of roster(); track r.player_id) {
      <div class="border rounded-xl p-2 flex items-center gap-2">
      <div class="text-sm grow">#{{r.jersey_number || '—'}} {{r.first_name}} {{r.last_name}}</div>
      <select class="select" [(ngModel)]="r.role">
      <option value="starter">Titulas</option>
      <option value="bench">Banca</option>
      <option value="inactive">Inactivo</option>
      </select>
      <input class="input w-32" placeholder="Pos" [(ngModel)]="r.position" />
      <button class="btn btn-danger" (click)="remove(r.player_id)">Quitar</button>
      </div>
      }
      </div>
      </div>
      </div>
      </div>
  `,
  styles: ``
})
export class RosterPage implements OnInit {
  private route = inject(ActivatedRoute); private api = inject(Api);
  eventId!: number; limit = 12; search = '';
  available = signal<Player[]>([]);
  roster = signal<any[]>([]); // entries joined with player info (from API)
  roleMap: Record<number, RosterRole> = {}; posMap: Record<number, string> = {};


  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    this.load();
  }
  load() {
    this.api.get<any[]>(`/api/rosters/${this.eventId}`).subscribe(r => { this.roster.set(r); });
    this.api.get(`/api/events`).subscribe((evs: any) => { const e = (evs as any[]).find(x => x.id === this.eventId); this.limit = e?.roster_limit || 12; });
    this.api.get<Player[]>('/api/players', { is_active: true }).subscribe(ps => {
      // remove already rostered players from available
      const rostered = new Set(this.roster().map(x => x.player_id));
      const avail = ps.filter(p => !rostered.has(p.id!));
      this.available.set(avail);
      avail.forEach(p => this.roleMap[p.id!] = 'starter');
    });
  }
  filteredAvailable() { const term = this.search.toLowerCase(); return this.available().filter(p => (p.first_name + " " + p.last_name).toLowerCase().includes(term)); }
  selectedCount() { return this.roster().filter(r => r.role === 'starter' || r.role === 'bench').length; }
  add(p: Player) {
    this.roster.update(list => [...list, { event_id: this.eventId, player_id: p.id!, role: this.roleMap[p.id!], position: this.posMap[p.id!], first_name: p.first_name, last_name: p.last_name, jersey_number: p.jersey_number }]);
    this.available.update(list => list.filter(x => x.id !== p.id));
  }
  remove(playerId: number) { this.roster.update(list => list.filter(x => x.player_id !== playerId)); }
  save() {
    const items: RosterEntry[] = this.roster().map(r => ({ event_id: this.eventId, player_id: r.player_id, role: r.role, position: r.position } as any));
    const sel = items.filter(i => i.role === 'starter' || i.role === 'bench').length;
    if (sel > this.limit) { alert(`Sobrepasa el límite (${this.limit}). Seleccionados: ${sel}`); return; }
    this.api.post(`/api/rosters/${this.eventId}/bulk`, { items }).subscribe({ next: _ => alert('Guardado'), error: e => alert(e?.error?.error || 'Error guardando') });
  }
}
