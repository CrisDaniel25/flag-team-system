
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/api';

type PubEvent = { id: number; type: 'practice' | 'game'; starts_at: string; ends_at?: string | null; location?: string | null; opponent?: string | null; };


@Component({
  selector: 'app-calendar-public',
  imports: [],
  template: `
<div class="card">
  <div class="flex items-center justify-between mb-3">
    <h2 class="font-semibold">Calendario · {{monthName()}} {{year()}}</h2>
    <div class="space-x-2">
      <button class="btn" (click)="prevMonth()">‹</button>
      <button class="btn" (click)="nextMonth()">›</button>
    </div>
  </div>

  <div class="grid grid-cols-7 gap-2 text-xs text-gray-600 mb-1">
    @for (d of weekDays; track d) {
      <div>{{d}}</div>
    }
  </div>

  <div class="grid grid-cols-7 gap-2">
    @for (c of cells(); track c) {
      <div class="border rounded-xl p-2 min-h-[90px]">
        <div class="text-xs font-medium" [class.opacity-40]="!c.inMonth">{{c.day}}</div>
        <div class="mt-1 space-y-1">
          @for (e of c.events; track e) {
            <div class="px-2 py-1 rounded-xl text-[11px]"
              [class.bg-green-100]="e.type==='practice'"
              [class.bg-blue-100]="e.type==='game'">
              {{e.type}} · {{ asTime(e.starts_at) }} @if (e.opponent) {
              <span>vs {{e.opponent}}</span>
            }
          </div>
        }
      </div>
    </div>
  }
</div>
</div>
`,
  styles: ``
})
export class CalendarPublicPage implements OnInit {
  private api = inject(Api);
  // estado del mes
  current = signal(new Date());
  events = signal<PubEvent[]>([]);
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit() { this.load(); }

  year = computed(() => this.current().getFullYear());
  month = computed(() => this.current().getMonth()); // 0-11
  monthName = computed(() => this.current().toLocaleString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()));

  async load() {
    const y = this.year(), m = this.month() + 1; // 1..12
    const from = `${y}-${String(m).padStart(2, '0')}-01`;
    const last = new Date(y, this.month() + 1, 0).getDate();
    const to = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
    this.api.get<PubEvent[]>('/api/public/events/range', { from, to }).subscribe(r => this.events.set(r));
  }

  prevMonth() { const d = new Date(this.current()); d.setMonth(d.getMonth() - 1); this.current.set(d); this.load(); }
  nextMonth() { const d = new Date(this.current()); d.setMonth(d.getMonth() + 1); this.current.set(d); this.load(); }

  cells() {
    const y = this.year(), m = this.month();
    const first = new Date(y, m, 1);
    const startIdx = (first.getDay() + 6) % 7; // Lunes=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = startIdx;
    const total = Math.ceil((startIdx + daysInMonth) / 7) * 7;

    const byDay: Record<string, PubEvent[]> = {};
    for (const e of this.events()) {
      const key = e.starts_at.slice(0, 10); // YYYY-MM-DD
      (byDay[key] ||= []).push(e);
    }

    const out: any[] = [];
    for (let i = 0; i < total; i++) {
      const dayNum = i - prevDays + 1;
      const date = new Date(y, m, dayNum);
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      out.push({ inMonth, day: date.getDate(), events: inMonth ? (byDay[key] || []) : [] });
    }
    return out;
  }

  asTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

}
