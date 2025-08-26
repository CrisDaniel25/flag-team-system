import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Api {
  constructor(private http: HttpClient) { }
  get<T>(url: string, params?: Record<string, any>) {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) p = p.set(k, String(v)); });
    return this.http.get<T>(`${environment.API_URL}${url}`, { params: p });
  }
  post<T>(url: string, body: any) { return this.http.post<T>(`${environment.API_URL}${url}`, body); }
  put<T>(url: string, body: any) { return this.http.put<T>(`${environment.API_URL}${url}`, body); }
  del<T>(url: string) { return this.http.delete<T>(`${environment.API_URL}${url}`); }
  postForm<T>(path: string, formData: FormData) {
    return this.http.post<T>(environment.API_URL + path, formData);
  }
  url(path: string) { return environment.API_URL + path; }
}
