import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Api } from '../../core/api';
import { ChartConfiguration } from 'chart.js';

type MetricsApi = {
  players: { total: number; active: number; male: number; female: number; nonbinary: number };
  upcoming_events: number;
  attendance_series: { id: number; starts_at: string; present: number; late: number; absent: number; pct_present: number }[];
  injuries_by_severity: { severity: string; count: number }[];
  payments_status: { by_status: { status: string|null; count: number }[]; overdue: number };
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  template: `
  <div class="grid md:grid-cols-2 gap-4">
    <div class="card">
      <h2 class="font-semibold mb-2">Roster</h2>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>Total: {{data?.totals?.players || 0}}</div>
        <div>Activos: {{data?.totals?.active || 0}}</div>
        <div>Hombres: {{data?.totals?.male || 0}}</div>
        <div>Mujeres: {{data?.totals?.female || 0}}</div>
      </div>
    </div>

    <div class="card">
      <h2 class="font-semibold mb-2">Asistencia (últimos 8)</h2>
      <canvas baseChart [type]="'line'" [data]="attendanceData" [options]="lineOpts"></canvas>
    </div>

    <div class="card">
      <h2 class="font-semibold mb-2">Lesiones por severidad</h2>
      <canvas baseChart [type]="'bar'" [data]="injuryData"></canvas>
    </div>

    <div class="card">
      <h2 class="font-semibold mb-2">Pagos</h2>
      <div class="text-sm grid grid-cols-2 gap-2">
        <div>Pendientes: {{data?.payments?.pending || 0}}</div>
        <div>Atrasados: {{data?.payments?.overdue || 0}}</div>
        <div>Pagados: {{data?.payments?.paid || 0}}</div>
        <div>Por pagar: {{data?.payments?.outstandingTotal || 0 | number:'1.2-2'}}</div>
      </div>
    </div>
  </div>
  `,
  styles: ``
})
export class DashboardPage implements OnInit {
  private api = inject(Api);

  // shape que usa tu template
  data: {
    totals: { players: number; active: number; male: number; female: number };
    payments: { pending: number; overdue: number; paid: number; outstandingTotal: number };
  } | null = null;

  lineOpts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
  attendanceData: ChartConfiguration['data'] = { labels: [], datasets: [{ data: [], label: 'Porcentaje %' }] };
  injuryData: ChartConfiguration['data'] = { labels: [], datasets: [{ data: [], label: 'Lesiones' }] };

  ngOnInit() {
    this.api.get<MetricsApi>('/api/metrics/summary').subscribe({
      next: (d) => {
        const series = d?.attendance_series ?? [];
        const injuries = d?.injuries_by_severity ?? [];
        const by = d?.payments_status?.by_status ?? [];

        const get = (s: string) => by.find(x => x.status === s)?.count ?? 0;

        // Mapeo al shape que usa tu UI
        this.data = {
          totals: {
            players: d?.players?.total ?? 0,
            active: d?.players?.active ?? 0,
            male: d?.players?.male ?? 0,
            female: d?.players?.female ?? 0
          },
          payments: {
            // suma “pending/unpaid/due” si existieran como estados
            pending: get('pending') + get('unpaid') + get('due'),
            overdue: d?.payments_status?.overdue ?? 0,
            paid: get('paid'),
            // si quieres totales de dinero, cámbialo cuando el backend exponga montos
            outstandingTotal: 0
          }
        };

        this.attendanceData = {
          labels: series.map(x => new Date(x.starts_at).toLocaleDateString()),
          datasets: [{ data: series.map(x => x.pct_present ?? 0), label: 'Porcentaje %' }]
        };

        this.injuryData = {
          labels: injuries.map(x => x.severity ?? 'unknown'),
          datasets: [{ data: injuries.map(x => x.count ?? 0), label: 'Conteo' }]
        };
      },
      error: (err) => {
        console.error('metrics summary failed', err);
        // valores seguros para no romper la vista
        this.data = { totals: { players:0, active:0, male:0, female:0 }, payments: { pending:0, overdue:0, paid:0, outstandingTotal:0 } };
        this.attendanceData = { labels: [], datasets: [{ data: [], label: 'Porcentaje %' }] };
        this.injuryData = { labels: [], datasets: [{ data: [], label: 'Lesiones' }] };
      }
    });
  }
}
