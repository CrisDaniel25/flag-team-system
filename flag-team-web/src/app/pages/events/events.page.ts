import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { Auth } from '../../core/auth';
import { Event } from '../../model'

type EventItem = {
  id?: number; type: 'practice' | 'game'; starts_at: string; ends_at?: string | null;
  location?: string | null; opponent?: string | null; notes?: string | null;
  roster_limit?: number; roster_policy?: any; is_public?: boolean;
};

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="card">
    <div class="flex items-center gap-2 mb-3">
      <h2 class="font-semibold">Eventos</h2>
      <button class="btn btn-primary ml-auto" (click)="openNew()">Nuevo</button>
    </div>
  
    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead class="text-left"><tr>
          <th class="py-2">Tipo</th><th>Inicio</th><th>Fin</th><th>Locación</th><th>Oponente</th><th>RosterLimit</th><th>Publ.</th><th class="text-right">Acciones</th>
        </tr></thead>
        <tbody>
          @for (e of events(); track e) {
            <tr>
              <td class="py-2">{{e.type}}</td>
              <td>{{e.starts_at | date:'short'}}</td>
              <td>{{e.ends_at | date:'short'}}</td>
              <td>{{e.location || '—'}}</td>
              <td>{{e.opponent || '—'}}</td>
              <td>{{e.roster_limit || '—'}}</td>
              <td>{{e.is_public ? 'Sí':'No'}}</td>
              <td class="text-right space-x-2">
                <a class="btn" [routerLink]="['/app/attendance', e.id]">Attendance</a>
                <a class="btn" [routerLink]="['/app/roster', e.id]">Roster</a>
                <button class="btn" (click)="edit(e)">Editar</button>
                <button class="btn btn-danger" (click)="remove(e)">Borrar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  
    <!-- Modal -->
    @if (open()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-4 w-full max-w-2xl space-y-3">
          <h3 class="font-semibold">{{form.id ? 'Editar' : 'Nuevo'}} Evento</h3>
          <div class="grid md:grid-cols-2 gap-3">
            <select class="select" [(ngModel)]="form.type" name="type">
              <option value="practice">practice</option>
              <option value="game">game</option>
            </select>
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.is_public" name="is_public"/> Público
            </label>
            <input class="input" type="datetime-local" [(ngModel)]="form.starts_at" name="starts_at"/>
            <input class="input" type="datetime-local" [(ngModel)]="form.ends_at" name="ends_at"/>
            <input class="input" placeholder="Locación" [(ngModel)]="form.location" name="location"/>
            <input class="input" placeholder="Oponente" [(ngModel)]="form.opponent" name="opponent"/>
            <input class="input" type="number" min="1" max="60" placeholder="Roster limit" [(ngModel)]="form.roster_limit" name="roster_limit"/>
            <textarea class="input md:col-span-2" rows="6" [(ngModel)]="policyText" name="roster_policy"
            placeholder='{"min_by_position":{"QB":1,"WR":2,"CB":2},"min_by_gender":{"male":5,"female":5}}'></textarea>
            <textarea class="input md:col-span-2" rows="3" placeholder="Notas" [(ngModel)]="form.notes" name="notes"></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn" (click)="close()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()">Guardar</button>
          </div>
        </div>
      </div>
    }
  </div>
  `,
  styles: ``
})
export class EventsPage implements OnInit {
  private api = inject(Api);
  events = signal<EventItem[]>([]);
  open = signal(false);
  form: EventItem = { type: 'practice', starts_at: new Date().toISOString().slice(0, 16) };
  policyText = '';

  ngOnInit() { this.load(); }
  load() { this.api.get<EventItem[]>('/api/events').subscribe(r => this.events.set(r)); }
  openNew() { this.form = { type: 'practice', starts_at: new Date().toISOString().slice(0, 16), is_public: true }; this.policyText = ''; this.open.set(true); }
  edit(e: EventItem) { this.form = { ...e }; this.policyText = e.roster_policy ? JSON.stringify(e.roster_policy, null, 2) : ''; this.open.set(true); }
  close() { this.open.set(false); }

  save() {
    // parsear policy JSON si hay texto
    if (this.policyText?.trim()) {
      try { this.form.roster_policy = JSON.parse(this.policyText); }
      catch { alert('JSON inválido en roster_policy'); return; }
    } else {
      delete this.form.roster_policy;
    }
    const body = { ...this.form };
    const req = this.form.id
      ? this.api.put<EventItem>(`/api/events/${this.form.id}`, body)
      : this.api.post<EventItem>('/api/events', body);
    req.subscribe({
      next: _ => { this.open.set(false); this.load(); },
      error: e => alert(e?.error?.error || 'Error guardando evento')
    });
  }

  remove(e: EventItem) {
    if (!confirm('¿Eliminar evento?')) return;
    // Si tienes delete en backend; si no, omite:
    // this.api.delete(`/api/events/${e.id}`).subscribe(_=> this.load());
    alert('Implementa DELETE si lo necesitas');
  }
}
