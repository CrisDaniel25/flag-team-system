import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/api';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule],
  template: `
 <div class="card max-w-3xl mx-auto">
    <h2 class="font-semibold mb-3">Formulario de Inscripción</h2>

    <form (ngSubmit)="submit()" class="grid md:grid-cols-2 gap-3">
      <input class="input" placeholder="Cédula / ID" [(ngModel)]="f.national_id" name="national_id">
      <input class="input" placeholder="Nombre *" [(ngModel)]="f.first_name" name="first_name" required>
      <input class="input" placeholder="Apellido *" [(ngModel)]="f.last_name" name="last_name" required>

      <select class="select" [(ngModel)]="f.gender" name="gender" required>
        <option value="" disabled>Género *</option>
        <option value="male">Hombre</option>
        <option value="female">Mujer</option>
      </select>

      <select class="select" [(ngModel)]="f.position" name="position">
        <option value="">Posición</option>
        <option *ngFor="let p of positions" [value]="p">{{p}}</option>
      </select>

      <input class="input" type="number" min="0" max="999" placeholder="# Jersey" [(ngModel)]="f.jersey_number" name="jersey_number">
      <input class="input" type="number" min="100" max="250" placeholder="Altura (cm)" [(ngModel)]="f.height_cm" name="height_cm">
      <input class="input" type="number" min="30" max="250" placeholder="Peso (kg)" [(ngModel)]="f.weight_kg" name="weight_kg">
      <input class="input" type="date" placeholder="Fecha nac." [(ngModel)]="f.birthdate" name="birthdate">
      <input class="input" placeholder="Teléfono" [(ngModel)]="f.phone" name="phone">
      <input class="input" type="email" placeholder="Email" [(ngModel)]="f.email" name="email">

      <input class="input" placeholder="Contacto de emergencia" [(ngModel)]="f.emergency_name" name="emergency_name">
      <input class="input" placeholder="Teléfono emergencia" [(ngModel)]="f.emergency_phone" name="emergency_phone">
      <input class="input" placeholder="Parentesco" [(ngModel)]="f.emergency_relation" name="emergency_relation">

      <textarea class="input md:col-span-2" rows="4" placeholder="Notas" [(ngModel)]="f.notes" name="notes"></textarea>

      <div class="md:col-span-2 flex gap-2 justify-end">
        <button class="btn" type="button" (click)="reset()">Limpiar</button>
        <button class="btn btn-primary" type="submit" [disabled]="loading()">Enviar</button>
      </div>
    </form>

    <div class="mt-3 p-3 rounded-xl bg-green-50 text-green-800" *ngIf="ok()">¡Gracias! Tu solicitud fue enviada. Te contactaremos por WhatsApp/Email.</div>
    <div class="mt-3 p-3 rounded-xl bg-red-50 text-red-800" *ngIf="error()">{{error()}}</div>
  </div>
  `,
  styles: ``
})
export class RegistrationPublicPage {
  private api = inject(Api);
  positions = ['QB', 'WR', 'RB', 'TE', 'LB', 'CB', 'S', 'DL'];
  f: any = { gender: '', position: '' };
  loading = signal(false);
  ok = signal(false);
  error = signal<string | null>(null);

  reset() { this.f = { gender: '', position: '' }; this.ok.set(false); this.error.set(null); }

  submit() {
    this.loading.set(true);
    this.error.set(null); this.ok.set(false);
    this.api.post('/api/public/registrations/public', this.f).subscribe({
      next: _ => { this.ok.set(true); this.loading.set(false); this.reset(); },
      error: e => { this.error.set(e?.error?.error || 'Error'); this.loading.set(false); }
    });
  }
}
