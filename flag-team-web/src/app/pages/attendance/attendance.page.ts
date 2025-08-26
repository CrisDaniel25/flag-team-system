
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../core/api';
import { Attendance, AttendanceStatus, Player } from '../../model';

@Component({
  selector: 'app-attendance',
  imports: [FormsModule],
  template: `
<div class="card">
    <h2 class="font-semibold mb-3">Asistencia</h2>
    <table class="min-w-full text-sm">
      <thead><tr class="text-left border-b"><th class="p-2">Jugador</th><th class="p-2">Estado</th><th class="p-2">Notas</th><th class="p-2"></th></tr></thead>
      <tbody>
        @for(p of players(); track p.id){
          <tr class="border-b">
            <td class="p-2">{{p.first_name}} {{p.last_name}}</td>
            <td class="p-2">
              <select class="select" [(ngModel)]="statusMap[p.id!]">
                <option value="present">Presente</option>
                <option value="absent">Ausente</option>
                <option value="late">Tarde</option>
              </select>
            </td>
            <td class="p-2"><input class="input" [(ngModel)]="noteMap[p.id!]" placeholder="Notas"/></td>
            <td class="p-2 text-right"><button class="btn" (click)="saveOne(p.id!)">Guardar</button></td>
          </tr>
        }
      </tbody>
    </table>
    <div class="mt-3 flex gap-2 justify-end"><button class="btn btn-primary" (click)="saveAll()">Guardar todo</button></div>
  </div>
  `,
  styles: ``
})
export class AttendancePage implements OnInit {
  private route = inject(ActivatedRoute); private api = inject(Api);
  eventId!: number; players = signal<Player[]>([]);
  statusMap: Record<number, AttendanceStatus> = {}; noteMap: Record<number, string> = {};
  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    this.api.get<Player[]>('/api/players', { is_active: true }).subscribe(ps => {
      this.players.set(ps);
      ps.forEach(p => this.statusMap[p.id!] = 'present');
    });
  }
  saveOne(playerId: number) {
    const body: Attendance = { event_id: this.eventId, player_id: playerId, status: this.statusMap[playerId], notes: this.noteMap[playerId] };
    this.api.post('/api/attendance', body).subscribe({ next: _ => { }, error: e => alert('Save failed') });
  }
  saveAll() {
    const list = Object.keys(this.statusMap).map(k => ({ event_id: this.eventId, player_id: Number(k), status: this.statusMap[Number(k)], notes: this.noteMap[Number(k)] }));
    this.api.post('/api/attendance/bulk', { items: list }).subscribe({ next: _ => alert('Saved'), error: e => alert('Bulk save failed') });
  }
}
