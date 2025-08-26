import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';
import { Auth } from '../../core/auth';
import { Payment, Player } from '../../model';

@Component({
  selector: 'app-payments',
 imports:[CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="flex items-center gap-2 mb-3">
      <h2 class="font-semibold">Pagos</h2>
      @if (isAdmin()) {
        <button class="btn btn-primary ml-auto" (click)="startCreate()">+ Nuevo</button>
      }
    </div>
  
    <table class="min-w-full text-sm">
      <thead><tr class="text-left border-b"><th class="p-2">Jugador</th><th class="p-2">Monto</th><th class="p-2">Estado</th><th class="p-2">Vence</th><th class="p-2">Pagado</th><th></th></tr></thead>
      <tbody>
        @for (p of items(); track p.id) {
          <tr class="border-b">
            <td class="p-2">{{playerName(p.player_id)}}</td>
            <td class="p-2">{{p.amount | number:'1.2-2'}} {{p.currency}}</td>
            <td class="p-2">{{p.status}}</td>
            <td class="p-2">{{p.due_date || '—'}}</td>
            <td class="p-2">{{p.paid_at || '—'}}</td>
            <td class="p-2 text-right">@if (isAdmin()) {
              <button class="btn" (click)="edit(p)">Editar</button>
            }</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
  
  @if (showForm) {
    <div class="card mt-4">
      <h2 class="font-semibold mb-2">{{editing?'Editar':'Nuevo'}} Pago</h2>
      <form class="form-grid" (ngSubmit)="save()">
        <select class="select" [(ngModel)]="form.player_id" name="player_id" required>
          @for (p of players(); track p.id) { <option [ngValue]="p.id">{{p.first_name}} {{p.last_name}}</option> }
        </select>
        <input class="input" type="number" step="0.01" [(ngModel)]="form.amount" name="amount" placeholder="Monto" required />
        <select class="select" [(ngModel)]="form.currency" name="currency">
          <option value="USD">USD</option><option value="DOP">DOP</option><option value="EUR">EUR</option>
        </select>
        <select class="select" [(ngModel)]="form.status" name="status">
          <option value="pending">Pendiente</option><option value="paid">Pagado</option><option value="overdue">Atrasado</option>
        </select>
        <input class="input" type="date" [(ngModel)]="form.due_date" name="due_date" />
        <input class="input" type="datetime-local" [(ngModel)]="form.paid_at" name="paid_at" />
        <textarea class="input" [(ngModel)]="form.notes" name="notes" placeholder="Notas"></textarea>
        <div class="col-span-full flex gap-2"><button class="btn btn-primary">Guardar</button><button class="btn" type="button" (click)="cancel()">Cancelar</button></div>
      </form>
    </div>
  }
  `,
  styles: ``
})
export class PaymentsPage {
  private api = inject(Api); private auth = inject(Auth);
  items = signal<Payment[]>([]); players = signal<Player[]>([]); showForm=false; editing=false; form: Payment = { player_id:0, amount:0, currency:'USD', status:'pending' };
  isAdmin = ()=>this.auth.isAdmin();
  ngOnInit(){ this.api.get<Player[]>('/api/players',{is_active:true}).subscribe(p=>this.players.set(p)); this.load(); }
  load(){ this.api.get<Payment[]>('/api/payments').subscribe(i=>this.items.set(i)); }
  playerName(id:number){ const p=this.players().find(x=>x.id===id); return p? `${p.first_name} ${p.last_name}`:'—'; }
  startCreate(){ this.form={ player_id:this.players()[0]?.id||0, amount:0, currency:'USD', status:'pending' }; this.editing=false; this.showForm=true; }
  edit(i:Payment){ this.form=structuredClone(i); this.editing=true; this.showForm=true; }
  save(){ (this.editing? this.api.put(`/api/payments/${this.form.id}`,this.form): this.api.post('/api/payments',this.form)).subscribe({ next:_=>{this.showForm=false; this.load();}, error:e=>alert('Save failed')}); }
  cancel(){ this.showForm=false; }
}
