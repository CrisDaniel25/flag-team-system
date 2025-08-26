
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';
import { Auth } from '../../core/auth';
import { Player } from '../../model';


@Component({
  selector: 'app-players',
  imports: [FormsModule],
  template: `
  <div class="card">
    <div class="flex items-center gap-3 mb-3">
      <input class="input" placeholder="Search" [(ngModel)]="search" (input)="load()"/>
      <button class="btn" (click)="downloadTemplate()">Plantilla Excel</button>
      <button class="btn btn-primary" (click)="openImport()">Importar Excel</button>
      @if (isAdmin()) {
        <button class="btn btn-primary ml-auto" (click)="startCreate()">+ Nuevo Jugador</button>
      }
    </div>
  
    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead><tr class="text-left border-b">
          <th class="p-2">#</th><th class="p-2">Nombre</th><th class="p-2">Género</th><th class="p-2">Posición</th><th class="p-2">Altura</th><th class="p-2">Peso</th><th class="p-2"></th>
        </tr></thead>
        <tbody>
          @for (p of players(); track p.id) {
            <tr class="border-b hover:bg-gray-50">
              <td class="p-2">{{p.jersey_number || '—'}}</td>
              <td class="p-2">{{p.first_name}} {{p.last_name}}</td>
              <td class="p-2">{{p.gender}}</td>
              <td class="p-2">{{p.position || '—'}}</td>
              <td class="p-2">{{p.height_cm || '—'}}</td>
              <td class="p-2">{{p.weight_kg || '—'}}</td>
              <td class="p-2 text-right">
                @if (isAdmin()) {
                  <button class="btn" (click)="edit(p)">Editar</button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
  
  @if (showForm) {
    <div class="card mt-4">
      <h2 class="font-semibold mb-2">{{editing ? 'Editar' : 'Nuevo'}} Jugador</h2>
      <form class="form-grid" (ngSubmit)="save()">
        <input class="input" [(ngModel)]="form.first_name" name="first_name" placeholder="Nombre" required />
        <input class="input" [(ngModel)]="form.last_name" name="last_name" placeholder="Apellido" required />
        <select class="select" [(ngModel)]="form.gender" name="gender" required>
          <option value="male">Hombre</option><option value="female">Mujer</option>
        </select>
        <input class="input" type="number" [(ngModel)]="form.jersey_number" name="jersey_number" placeholder="Jersey #" />
        <input class="input" type="number" step="0.01" [(ngModel)]="form.height_cm" name="height_cm" placeholder="Altura (cm)" />
        <input class="input" type="number" step="0.01" [(ngModel)]="form.weight_kg" name="weight_kg" placeholder="Peso (kg)" />
        <input class="input" [(ngModel)]="form.position" name="position" placeholder="Posición" />
        <textarea class="input" [(ngModel)]="form.notes" name="notes" placeholder="Notas"></textarea>
        <input class="input" [(ngModel)]="form.national_id" name="national_id" placeholder="Cédula / ID" />
        <input class="input" [(ngModel)]="form.emergency_name" name="emergency_name" placeholder="Contacto de emergencia" />
        <input class="input" [(ngModel)]="form.emergency_phone" name="emergency_phone" placeholder="Tel. contacto" />
        <input class="input" [(ngModel)]="form.emergency_relation" name="emergency_relation" placeholder="Parentesco" />
        <div class="col-span-full flex gap-2">
          <button class="btn btn-primary">Guardar</button>
          <button class="btn" type="button" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
  }
  
  <!-- Modal Import -->
  @if (importOpen()) {
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-4 w-full max-w-xl space-y-3">
        <h3 class="font-semibold">Importar jugadores (.xlsx)</h3>
        <input type="file" accept=".xlsx,.xls" (change)="onFile($event)" />
        <div class="text-xs text-gray-600">Usa la hoja <b>PLAYERS</b>. Revisa la hoja <b>INSTRUCTIONS</b> para formatos.</div>
        <div class="flex gap-2 justify-end">
          <button class="btn" (click)="closeImport()">Cancelar</button>
          <button class="btn btn-primary" (click)="doImport()" [disabled]="!file">Subir</button>
        </div>
        @if (importResult) {
          <div class="mt-3 text-sm">
            <div>Insertados: <b>{{importResult.inserted}}</b> · Actualizados: <b>{{importResult.updated}}</b> · Omitidos: <b>{{importResult.skipped}}</b></div>
            @if (importResult.errors?.length) {
              <ul class="mt-2 text-red-600 text-xs space-y-1 max-h-48 overflow-auto">
                @for (e of importResult.errors; track e) {
                  <li>Fila {{e.row}}: {{e.error}}</li>
                }
              </ul>
            }
          </div>
        }
      </div>
    </div>
  }
  `,
  styles: ``
})
export class PlayersPage {
  private api = inject(Api); private auth = inject(Auth);
  players = signal<Player[]>([]); search = ''; showForm = false; editing = false; form: Player = { first_name: '', last_name: '', gender: 'male', is_active: true };
  isAdmin = () => this.auth.isAdmin();
  ngOnInit() { this.load(); }
  load() { this.api.get<Player[]>('/api/players', this.search ? { search: this.search } : undefined).subscribe(p => this.players.set(p)); }
  startCreate() { this.form = { first_name: '', last_name: '', gender: 'male', is_active: true }; this.editing = false; this.showForm = true; }
  edit(p: Player) { this.form = structuredClone(p); this.editing = true; this.showForm = true; }
  save() {
    const req = this.editing ? this.api.put<Player>(`/api/players/${this.form.id}`, this.form) : this.api.post<Player>('/api/players', this.form);
    req.subscribe({ next: _ => { this.showForm = false; this.load(); }, error: e => alert(e?.error?.error || 'Save failed') });
  }
  cancel() { this.showForm = false; }

  importOpen = signal(false);
  file?: File | null;
  importResult: any = null;

  downloadTemplate() {
    // abre en nueva pestaña para descargar
    window.open(this.api.url('/api/players/template.xlsx'), '_blank');
  }
  openImport() { this.importOpen.set(true); this.importResult = null; this.file = null; }
  closeImport() { this.importOpen.set(false); }
  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }
  doImport() {
    if (!this.file) return;
    const fd = new FormData();
    fd.append('file', this.file);
    this.api.postForm<any>('/api/players/import', fd).subscribe({
      next: (r) => {
        this.importResult = r;
        // actualiza la lista de jugadores si tienes load()
        if (typeof this.load === 'function') this.load();
      },
      error: (e) => {
        alert(e?.error?.error || 'Importación falló');
      }
    });
  }
}
