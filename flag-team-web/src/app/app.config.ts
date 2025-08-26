import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth-interceptor';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  // Público (landing)
  {
    path: '', loadComponent: () => import('./public/public-shell/public-shell.page').then(m => m.PublicShellPage), children: [
      { path: '', loadComponent: () => import('./public/home-public/home-public.page').then(m => m.HomePublicPage) },
      { path: 'jugadores', loadComponent: () => import('./public/players-public/players-public.page').then(m => m.PlayersPublicPage) },
      { path: 'eventos', loadComponent: () => import('./public/events-public/events-public.page').then(m => m.EventsPublicPage) },
      { path: 'patrocinadores', loadComponent: () => import('./public/sponsors-public/sponsors-public.page').then(m => m.SponsorsPublicPage) },
      { path: 'calendario', loadComponent: () => import('./public/calendar-public/calendar-public.page').then(m => m.CalendarPublicPage) },
      { path: 'reglamentos', loadComponent: () => import('./public/regulations/regulations.page').then(m => m.RegulationsPublicPage) },
      { path: 'inscripcion', loadComponent: () => import('./public/registration/registration.page').then(m => m.RegistrationPublicPage) },
    ]
  },

  // Login
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },

  // Admin (app)
  {
    path: 'app', loadComponent: () => import('./pages/shell/shell.page').then(m => m.ShellPage), canActivate: [authGuard], children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'players', loadComponent: () => import('./pages/players/players.page').then(m => m.PlayersPage) },
      { path: 'events', loadComponent: () => import('./pages/events/events.page').then(m => m.EventsPage) },
      { path: 'attendance/:eventId', loadComponent: () => import('./pages/attendance/attendance.page').then(m => m.AttendancePage) },
      { path: 'injuries', loadComponent: () => import('./pages/injuries/injuries.page').then(m => m.InjuriesPage) },
      { path: 'payments', loadComponent: () => import('./pages/payments/payments.page').then(m => m.PaymentsPage) },
      { path: 'uploads', loadComponent: () => import('./pages/uploads/uploads.page').then(m => m.UploadsPage) },
      { path: 'roster/:eventId', loadComponent: () => import('./pages/roster/roster.page').then(m => m.RosterPage) },
      { path: 'sponsors', loadComponent: () => import('./pages/sponsors/sponsors.page').then(m => m.SponsorsPage) },
      { path: 'ads', loadComponent: () => import('./pages/ads/ads.page').then(m => m.AdsPage) },
      { path: 'regulations', loadComponent: () => import('./pages/regulations/regulations.page').then(m => m.RegulationsPage) },
      { path: 'registrations', loadComponent: () => import('./pages/registration/registration.page').then(m => m.RegistrationPage) },
      { path: 'guide', loadComponent: () => import('./pages/admin-guide/admin-guide.page').then(m => m.AdminGuidePage) },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ]
};
