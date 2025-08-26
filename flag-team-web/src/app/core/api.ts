import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  // Usa variable de build si existe (NG_APP_API_URL), si no -> '/api'
  private base = (window as any).NG_APP_API_URL || '';

  get<T>(url: string, params?: Record<string, any>) {
    let hp = new HttpParams();
    if (params) { Object.keys(params).forEach(k => { if (params[k] != null) hp = hp.set(k, params[k]); }); }
    return this.http.get<T>(this.base + url, { params: hp });
  }
  post<T>(url: string, body: any) { return this.http.post<T>(this.base + url, body); }
  put<T>(url: string, body: any) { return this.http.put<T>(this.base + url, body); }
  postForm<T>(path: string, formData: FormData) {
    return this.http.post<T>(this.base + path, formData);
  }
  del<T>(url: string) { return this.http.delete<T>(this.base + url); }
  url(path: string) { return this.base + path; }
}
