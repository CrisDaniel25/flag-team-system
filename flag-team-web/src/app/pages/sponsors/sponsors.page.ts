
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';


type Sponsor = {
  id?: number;
  name: string;
  tier: 'gold' | 'silver' | 'bronze' | 'partner';
  logo_url?: string | null;
  link_url?: string | null;
  active?: boolean;
  sort_order?: number;
};

@Component({
  selector: 'app-sponsors',
  imports: [FormsModule],
  template: `
<div class="card">
  <div class="flex items-center gap-2 mb-3">
    <h2 class="font-semibold">Patrocinadores</h2>
    <button class="btn btn-primary ml-auto" (click)="openNew()">Nuevo</button>
  </div>

  <div class="overflow-auto">
    <table class="min-w-full text-sm">
      <thead class="text-left">
        <tr>
          <th class="py-2">Orden</th>
          <th>Nombre</th>
          <th>Tier</th>
          <th>Activo</th>
          <th>Logo</th>
          <th>Link</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        @for (s of sponsors(); track s) {
          <tr>
            <td class="py-2">{{s.sort_order || 0}}</td>
            <td>{{s.name}}</td>
            <td class="uppercase">{{s.tier}}</td>
            <td>{{s.active ? 'Sí' : 'No'}}</td>
            <td class="truncate max-w-[180px]">{{s.logo_url || '—'}}</td>
            <td class="truncate max-w-[180px]">{{s.link_url || '—'}}</td>
            <td class="text-right space-x-2">
              <button class="btn" (click)="edit(s)">Editar</button>
              <button class="btn btn-danger" (click)="remove(s)">Eliminar</button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>

  <!-- Modal simple -->
  @if (modalOpen()) {
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-4 w-full max-w-xl space-y-3">
        <h3 class="font-semibold">{{form.id ? 'Editar' : 'Nuevo'}} Patrocinador</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <input class="input" placeholder="Nombre" [(ngModel)]="form.name" name="name"/>
          <select class="select" [(ngModel)]="form.tier" name="tier">
            <option value="gold">gold</option>
            <option value="silver">silver</option>
            <option value="bronze">bronze</option>
            <option value="partner">partner</option>
          </select>
          <input class="input" placeholder="Logo URL" [(ngModel)]="form.logo_url" name="logo_url"/>
          <input class="input" placeholder="Link URL" [(ngModel)]="form.link_url" name="link_url"/>
          <input class="input" placeholder="Orden (número)" type="number" [(ngModel)]="form.sort_order" name="sort_order"/>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.active" name="active"/> Activo
          </label>
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
export class SponsorsPage implements OnInit {
  private api = inject(Api);
  sponsors = signal<Sponsor[]>([]);
  modalOpen = signal(false);
  form: Sponsor = { name: '', tier: 'gold', active: true, sort_order: 0 };

  ngOnInit() { this.load(); }

  load() { this.api.get<Sponsor[]>('/api/sponsors').subscribe(r => this.sponsors.set(r)); }
  openNew() { this.form = { name: '', tier: 'gold', active: true, sort_order: 0 }; this.modalOpen.set(true); }
  edit(s: Sponsor) { this.form = { ...s }; this.modalOpen.set(true); }
  close() { this.modalOpen.set(false); }

  save() {
    const body = { ...this.form };
    const req = this.form.id
      ? this.api.put<Sponsor>(`/api/sponsors/${this.form.id}`, body)
      : this.api.post<Sponsor>('/api/sponsors', body);
    req.subscribe({
      next: _ => { this.modalOpen.set(false); this.load(); },
      error: e => alert(e?.error?.error || 'Error guardando sponsor')
    });
  }

  remove(s: Sponsor) {
    if (!confirm(`Eliminar sponsor "${s.name}"?`)) return;
    this.api.del(`/api/sponsors/${s.id}`).subscribe({
      next: _ => this.load(),
      error: e => alert(e?.error?.error || 'Error eliminando sponsor')
    });
  }
}
