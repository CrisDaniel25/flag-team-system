import { Component, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regulations',
  imports: [CommonModule],
  template: `
   <div class="card">
    <h2 class="font-semibold mb-3">{{reg()?.title || 'Reglamento'}}</h2>
    <div class="prose max-w-none" [innerHTML]="reg()?.body_html"></div>
    <div class="text-xs text-gray-500 mt-3" *ngIf="reg()?.updated_at">Última actualización: {{reg()?.updated_at | date:'medium'}}</div>
  </div>
  `,
  styles: ``
})
export class RegulationsPublicPage implements OnInit {
  private api = inject(Api);
  reg = signal<any | null>(null);
  ngOnInit() {
    this.api.get<any>('/api/public/regulations', { slug: 'team-rules' }).subscribe(r => this.reg.set(r));
  }
}