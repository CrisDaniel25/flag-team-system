import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-home-public',
  imports: [CommonModule],
  template: `
  <!-- HERO / CAROUSEL -->
  @if (hero().length) {
    <section class="relative rounded-2xl overflow-hidden mb-6">
      <div class="relative h-64 md:h-80">
        <img class="absolute inset-0 w-full h-full object-cover"
          [src]="hero()[idx()].image_url || 'https://picsum.photos/1200/600?grayscale'"
          alt="" />
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
            <h2 class="text-2xl md:text-3xl font-bold">{{hero()[idx()].title}}</h2>
            <p class="max-w-2xl text-sm opacity-90">{{hero()[idx()].body}}</p>
            @if (hero()[idx()].link_url) {
              <a [href]="hero()[idx()].link_url" target="_blank"
              class="inline-block mt-3 px-4 py-2 bg-white text-black rounded-xl">Ver más</a>
            }
          </div>
        </div>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
          <button class="btn" (click)="prev()">‹</button>
          <button class="btn" (click)="next()">›</button>
        </div>
      </section>
    }
  
    <!-- Próximos eventos + Sponsors -->
    <div class="grid md:grid-cols-2 gap-4">
      <div class="card">
        <h3 class="font-semibold mb-2">Próximos eventos</h3>
        <ul class="text-sm space-y-2">
          @for (e of events(); track e) {
            <li>
              <div class="flex items-center justify-between">
                <div>{{e.type}} · {{e.starts_at | date:'medium'}} · {{e.location || '—'}}</div>
                @if (e.opponent) {
                  <span class="text-xs px-2 py-0.5 rounded-xl bg-gray-100">vs {{e.opponent}}</span>
                }
              </div>
            </li>
          }
        </ul>
      </div>
  
      <div class="card">
        <h3 class="font-semibold mb-2">Patrocinadores</h3>
        @for (tier of tiers; track tier) {
          <div class="font-medium mt-2 mb-1 capitalize">{{tier}}</div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            @for (s of sponsorsByTier(tier); track s) {
              <a [href]="s.link_url || '#'" target="_blank"
                class="border rounded-xl p-3 text-center hover:shadow">
                <div class="font-medium">{{s.name}}</div>
                <div class="text-xs text-gray-500">{{s.tier}}</div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class HomePublicPage implements OnInit {
  private api = inject(Api);
  hero = signal<any[]>([]);
  idx = signal(0);
  events = signal<any[]>([]);
  sponsors = signal<any[]>([]);
  tiers = ['gold', 'silver', 'bronze', 'partner'];

  ngOnInit() {
    this.api.get<any[]>('/api/public/ads', { placement: 'hero' }).subscribe(r => this.hero.set(r));
    this.api.get<any[]>('/api/public/events/upcoming', { limit: 6 }).subscribe(r => this.events.set(r));
    this.api.get<any[]>('/api/public/sponsors').subscribe(r => this.sponsors.set(r));
    // autoplay simple
    setInterval(() => this.next(), 5000);
  }
  next() { if (!this.hero().length) return; this.idx.set((this.idx() + 1) % this.hero().length); }
  prev() { if (!this.hero().length) return; this.idx.set((this.idx() - 1 + this.hero().length) % this.hero().length); }
  sponsorsByTier(tier: string) { return this.sponsors().filter(s => s.tier === tier && s.active !== false); }
}
