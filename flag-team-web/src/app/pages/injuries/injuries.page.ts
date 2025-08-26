import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';
import { Auth } from '../../core/auth';
import { Injury, Player } from '../../model';

@Component({
  selector: 'app-injuries',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="flex gap-2 items-center mb-3">
      <h2 class="font-semibold">Lesiones</h2>
      @if (isAdmin()) {
        <button class="btn btn-primary ml-auto" (click)="startCreate()">+ Nueva</button>
      }
    </div>
  
    <table class="min-w-full text-sm">
      <thead><tr class="text-left border-b"><th class="p-2">Fecha</th><th class="p-2">Jugador</th><th class="p-2">Tipo</th><th class="p-2">Severidad</th><th class="p-2">RTP</th><th></th></tr></thead>
      <tbody>
        @for (i of items(); track i.id) {
          <tr class="border-b">
            <td class="p-2">{{i.date | date:'shortDate'}}</td>
            <td class="p-2">{{playerName(i.player_id)}}</td>
            <td class="p-2">{{i.kind}}</td>
            <td class="p-2">{{i.severity}}</td>
            <td class="p-2">{{i.return_to_play || '—'}}</td>
            <td class="p-2 text-right">@if (isAdmin()) {
              <button class="btn" (click)="edit(i)">Editar</button>
            }</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
  
  @if(showForm){
    <div class="card mt-4">
      <h2 class="font-semibold mb-2">{{editing?'Editar':'Nueva'}} Lesión</h2>
      <form class="form-grid" (ngSubmit)="save()">
        <select class="select" [(ngModel)]="form.player_id" name="player_id" required>
          @for(p of players(); track p.id){ <option [ngValue]="p.id">{{p.first_name}} {{p.last_name}}</option> }
        </select>
        <input class="input" type="date" [(ngModel)]="form.date" name="date" required />
        <input class="input" [(ngModel)]="form.kind" name="kind" placeholder="Tipo" required />
        <select class="select" [(ngModel)]="form.severity" name="severity" required>
          <option value="minor">Leve</option><option value="moderate">Moderada</option><option value="severe">Grave</option>
        </select>
        <input class="input" type="date" [(ngModel)]="form.return_to_play" name="return_to_play" />
        <textarea class="input" [(ngModel)]="form.notes" name="notes" placeholder="Notas"></textarea>
        <div class="col-span-full flex gap-2"><button class="btn btn-primary">Guardar</button><button class="btn" type="button" (click)="cancel()">Cancelar</button></div>
      </form>
    </div>
  }
  `,
  styles: ``
})
export class InjuriesPage {
  private api = inject(Api); private auth = inject(Auth);
  items = signal<Injury[]>([]); players = signal<Player[]>([]); showForm = false; editing = false; form: Injury = { player_id: 0, date: new Date().toISOString().slice(0, 10), kind: '', severity: 'minor' };
  isAdmin = () => this.auth.isAdmin();
  ngOnInit() { this.api.get<Player[]>('/api/players', { is_active: true }).subscribe(p => this.players.set(p)); this.load(); }
  load() { this.api.get<Injury[]>('/api/injuries').subscribe(i => this.items.set(i)); }
  playerName(id: number) { const p = this.players().find(x => x.id === id); return p ? `${p.first_name} ${p.last_name}` : '—'; }
  startCreate() { this.form = { player_id: this.players()[0]?.id || 0, date: new Date().toISOString().slice(0, 10), kind: '', severity: 'minor' }; this.editing = false; this.showForm = true; }
  edit(i: Injury) { this.form = structuredClone(i); this.editing = true; this.showForm = true; }
  save() { (this.editing ? this.api.put(`/api/injuries/${this.form.id}`, this.form) : this.api.post('/api/injuries', this.form)).subscribe({ next: _ => { this.showForm = false; this.load(); }, error: e => alert('Save failed') }); }
  cancel() { this.showForm = false; }
}
