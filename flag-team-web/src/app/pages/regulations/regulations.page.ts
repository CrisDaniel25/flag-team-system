import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';

@Component({
  selector: 'app-regulations',
  imports: [CommonModule, FormsModule],
  template: `
 <div class="card max-w-3xl">
    <div class="flex items-center gap-2 mb-3">
      <h2 class="font-semibold">Reglamentos</h2>
      <button class="btn ml-auto" (click)="load()">Recargar</button>
      <button class="btn btn-primary" (click)="save()">Guardar</button>
    </div>

    <div class="grid gap-3">
      <div class="grid md:grid-cols-2 gap-2">
        <input class="input" placeholder="Slug" [(ngModel)]="form.slug" name="slug">
        <input class="input" placeholder="Título" [(ngModel)]="form.title" name="title">
      </div>
      <label class="flex items-center gap-2">
        <input type="checkbox" [(ngModel)]="form.is_public" name="is_public"> Público
      </label>
      <textarea class="input" rows="14" [(ngModel)]="form.body_html" name="body_html" placeholder="<h2>...</h2> HTML permitido"></textarea>

      <div class="mt-2">
        <div class="text-xs text-gray-500 mb-1">Vista previa:</div>
        <div class="prose max-w-none border rounded-xl p-3" [innerHTML]="form.body_html"></div>
      </div>
    </div>
  </div>
  `,
  styles: ``
})
export class RegulationsPage implements OnInit {
  private api = inject(Api);
  form: any = { slug: 'team-rules', title: '', body_html: '', is_public: true };

  ngOnInit() { this.load(); }
  load() {
    this.api.get<any>('/api/public/regulations', { slug: this.form.slug }).subscribe({
      next: r => { this.form.title = r.title; this.form.body_html = r.body_html; this.form.is_public = true; },
      error: _ => { } // si no existe, quedará vacío para crear
    });
  }
  save() {
    const body = { ...this.form };
    this.api.post('/api/regulations', body).subscribe({
      next: _ => alert('Guardado'),
      error: e => alert(e?.error?.error || 'Error guardando reglamento')
    });
  }
}
