import { computed, Injectable, signal } from '@angular/core';
import { User } from '../model';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

interface LoginResponse { token: string; user: User }

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private _user = signal<User | null>(null);
  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  isAdmin = computed(() => this._user()?.role === 'admin');
  token: string | null = null;

    private base = (window as any).NG_APP_API_URL || '';

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('flag.auth');
    if (saved) {
      const { token, user } = JSON.parse(saved);
      this.token = token; this._user.set(user);
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/api/auth/login`, { email, password });
  }

  setSession(token: string, user: User) {
    this.token = token;
    this._user.set(user);
    localStorage.setItem('flag.auth', JSON.stringify({ token, user }));
  }

  logout() {
    this.token = null; this._user.set(null); localStorage.removeItem('flag.auth');
  }
}
