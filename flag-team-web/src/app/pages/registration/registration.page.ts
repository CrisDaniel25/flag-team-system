import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-registration',
  imports: [CommonModule],
  template: `
<div class="card">
    <div class="flex items-center gap-2 mb-3">
      <h2 class="font-semibold">Inscripciones — {{status() | uppercase}}</h2>
      <select class="select ml-auto" (change)="setStatus($any($event.target).value)">
        <option value="pending">pending</option>
        <option value="invited">invited</option>
        <option value="approved">approved</option>
        <option value="rejected">rejected</option>
      </select>
      <button class="btn" (click)="load()">Recargar</button>
    </div>

    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead class="text-left">
          <tr>
            <th class="py-2">Nombre</th>
            <th>Género</th>
            <th>Pos</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()">
            <td class="py-2">{{r.first_name}} {{r.last_name}}</td>
            <td>{{r.gender}}</td>
            <td>{{r.position || '—'}}</td>
            <td>{{r.phone || '—'}}</td>
            <td>{{r.email || '—'}}</td>
            <td class="uppercase">{{r.status}}</td>
            <td class="text-right space-x-2">
              <a class="btn" (click)="whatsApp(r)">WhatsApp</a>
              <button class="btn btn-primary" (click)="approve(r)" *ngIf="r.status!=='approved'">Aprobar</button>
              <button class="btn btn-danger" (click)="reject(r)" *ngIf="r.status!=='rejected'">Rechazar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  styles: ``
})
export class RegistrationPage implements OnInit {
 private api = inject(Api);
  status = signal<'pending'|'invited'|'approved'|'rejected'>('pending');
  rows = signal<any[]>([]);

  ngOnInit(){ this.load(); }
  setStatus(s: any){ this.status.set(s); this.load(); }

  load(){
    this.api.get<any[]>('/api/registrations', { status: this.status() }).subscribe(r => this.rows.set(r));
  }

  whatsApp(r: any){
    const phone = (r.phone || '').replace(/[^0-9+]/g,'');
    const msg = `Hola ${r.first_name}, te invitamos a la práctica/juego del equipo. Responde este mensaje para confirmar.`;
    const link = `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
    // marca como invited en backend
    this.api.post(`/api/registrations/${r.id}/invite`, {}).subscribe({ next: _ => this.load() });
  }

  approve(r: any){
    if (!confirm(`Aprobar a ${r.first_name} ${r.last_name} y crear jugador activo?`)) return;
    this.api.post(`/api/registrations/${r.id}/approve`, {}).subscribe({
      next: _ => { alert('Aprobado y creado/actualizado en Players'); this.load(); },
      error: e => alert(e?.error?.error || 'Error al aprobar')
    });
  }

  reject(r: any){
    const reason = prompt('Motivo de rechazo (opcional):') || '';
    this.api.post(`/api/registrations/${r.id}/reject`, { reason }).subscribe({
      next: _ => this.load(),
      error: e => alert(e?.error?.error || 'Error al rechazar')
    });
  }
}
