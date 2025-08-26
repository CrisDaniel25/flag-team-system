
import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-sponsors-public',
  imports: [],
  template: `
<div class="card">
  <h2 class="font-semibold mb-3">Patrocinadores</h2>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    @for (s of sponsors(); track s) {
      <a [href]="s.link_url || '#'" target="_blank" class="border rounded-xl p-3 text-center hover:shadow">
        <div class="font-medium">{{s.name}}</div>
        <div class="text-xs text-gray-500">{{s.tier}}</div>
      </a>
    }
  </div>
</div>
`,
  styles: ``
})
export class SponsorsPublicPage {
  private api = inject(Api);
  sponsors = signal<any[]>([]);
  constructor() { this.api.get<any[]>('/api/public/sponsors').subscribe(r => this.sponsors.set(r)); }
}
