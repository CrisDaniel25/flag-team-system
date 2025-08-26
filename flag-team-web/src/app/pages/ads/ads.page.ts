
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';

type Ad = {
  id?: number;
  title: string;
  body?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  placement: 'hero' | 'banner' | 'sidebar';
  active?: boolean;
  start_at?: string | null;
  end_at?: string | null;
};

@Component({
  selector: 'app-ads',
  imports: [FormsModule],
  template: `
 <div class="card">
   <div class="flex items-center gap-2 mb-3">
     <h2 class="font-semibold">Anuncios</h2>
     <button class="btn btn-primary ml-auto" (click)="openNew()">Nuevo</button>
   </div>
 
   <div class="overflow-auto">
     <table class="min-w-full text-sm">
       <thead class="text-left">
         <tr><th class="py-2">Título</th><th>Ubicación</th><th>Activo</th><th>Rango</th><th class="text-right">Acciones</th></tr>
       </thead>
       <tbody>
         @for (a of ads(); track a) {
           <tr>
             <td class="py-2">{{a.title}}</td>
             <td class="uppercase">{{a.placement}}</td>
             <td>{{a.active ? 'Sí' : 'No'}}</td>
             <td class="text-xs">{{a.start_at || '—'}} → {{a.end_at || '—'}}</td>
             <td class="text-right space-x-2">
               <button class="btn" (click)="edit(a)">Editar</button>
               <button class="btn btn-danger" (click)="remove(a)">Eliminar</button>
             </td>
           </tr>
         }
       </tbody>
     </table>
   </div>
 
   <!-- Modal -->
   @if (modalOpen()) {
     <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
       <div class="bg-white rounded-2xl p-4 w-full max-w-xl space-y-3">
         <h3 class="font-semibold">{{form.id ? 'Editar' : 'Nuevo'}} Anuncio</h3>
         <div class="grid md:grid-cols-2 gap-3">
           <input class="input" placeholder="Título" [(ngModel)]="form.title" name="title"/>
           <select class="select" [(ngModel)]="form.placement" name="placement">
             <option value="hero">Principal</option>
             <option value="banner">Banner</option>
             <option value="sidebar">Lateral</option>
           </select>
           <textarea class="input md:col-span-2" placeholder="Contenido" [(ngModel)]="form.body" name="body"></textarea>
           <input class="input" placeholder="Image URL" [(ngModel)]="form.image_url" name="image_url"/>
           <input class="input" placeholder="Link URL" [(ngModel)]="form.link_url" name="link_url"/>
           <label class="flex items-center gap-2">
             <input type="checkbox" [(ngModel)]="form.active" name="active"/> Activo
           </label>
           <input class="input" type="datetime-local" [(ngModel)]="form.start_at" name="start_at"/>
           <input class="input" type="datetime-local" [(ngModel)]="form.end_at" name="end_at"/>
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
export class AdsPage implements OnInit {
  private api = inject(Api);
  ads = signal<Ad[]>([]);
  modalOpen = signal(false);
  form: Ad = { title: '', placement: 'hero', active: true };

  ngOnInit() { this.load(); }

  load() { this.api.get<Ad[]>('/api/ads').subscribe(r => this.ads.set(r)); }
  openNew() { this.form = { title: '', placement: 'hero', active: true }; this.modalOpen.set(true); }
  edit(a: Ad) { this.form = { ...a }; this.modalOpen.set(true); }
  close() { this.modalOpen.set(false); }

  save() {
    const body = { ...this.form };
    const req = this.form.id
      ? this.api.put<Ad>(`/api/ads/${this.form.id}`, body)
      : this.api.post<Ad>('/api/ads', body);
    req.subscribe({
      next: _ => { this.modalOpen.set(false); this.load(); },
      error: e => alert(e?.error?.error || 'Error guardando anuncio')
    });
  }

  remove(a: Ad) {
    if (!confirm(`Eliminar anuncio "${a.title}"?`)) return;
    this.api.del(`/api/ads/${a.id}`).subscribe({
      next: _ => this.load(),
      error: e => alert(e?.error?.error || 'Error eliminando anuncio')
    });
  }

}
