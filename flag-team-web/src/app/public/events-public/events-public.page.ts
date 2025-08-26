import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-events-public',
  imports: [CommonModule],
  template: `
  <div class="card">
    <h2 class="font-semibold mb-3">Eventos</h2>
    <ul class="text-sm">
      @for (e of events(); track e) {
        <li class="border-b py-2">{{e.type}} · {{e.starts_at | date:'medium'}} · {{e.location || '—'}} @if (e.opponent) {
          <span>vs {{e.opponent}}</span>
        }</li>
      }
    </ul>
  </div>
  `,
  styles: ``
})
export class EventsPublicPage {
  private api = inject(Api);
  events = signal<any[]>([]);
  constructor() { this.api.get<any[]>('/api/public/events/upcoming', { limit: 20 }).subscribe(r => this.events.set(r)); }
}
