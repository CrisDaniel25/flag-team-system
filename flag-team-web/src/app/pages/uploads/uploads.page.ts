
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';

@Component({
  selector: 'app-uploads',
  imports: [FormsModule], template: `
  <div class="card">
    <h2 class="font-semibold mb-3">Subir archivos (exenciones, fotos)</h2>
    <form class="grid gap-3" (ngSubmit)="upload()">
      <input class="input" type="file" (change)="onFile($event)" />
      <input class="input" placeholder="Carpeta (ej. exenciones)" [(ngModel)]="folder" name="folder" />
      <button class="btn btn-primary" [disabled]="!file">Subir</button>
    </form>
  
    @if (publicUrl) {
      <p class="mt-3 text-sm">Subido: <a class="text-blue-700 underline" [href]="publicUrl" target="_blank">{{publicUrl}}</a></p>
    }
  </div>
  `,
  styles: ``
})
export class UploadsPage {
  private api = inject(Api);
  file: File | null = null; folder = 'waivers'; publicUrl = '';
  onFile(e: any) { this.file = e.target.files?.[0] || null; }
  async upload() {
    if (!this.file) return;
    const { name, type } = this.file;
    const res: any = await this.api.post('/api/uploads/presign', { filename: name, contentType: type, folder: this.folder }).toPromise();
    const uploadUrl = res.uploadUrl; // presigned PUT
    await fetch(uploadUrl, { method: 'PUT', body: this.file, headers: { 'Content-Type': type } });
    this.publicUrl = res.publicUrl;
  }
}
