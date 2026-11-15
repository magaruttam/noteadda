import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${API_CONFIG.baseUrl}/auth`;
  private readonly tokenKey = 'noteadda_access_token';

  readonly isAuthenticated = signal<boolean>(this.hasStoredToken());

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, payload);
  }

  login(payload: LoginRequest, remember = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login/json`, payload).pipe(
      tap((response) => {
        const storage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;
        otherStorage.removeItem(this.tokenKey);
        storage.setItem(this.tokenKey, response.access_token);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  extractErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }
    if (error.status === 0) {
      return `Unable to reach the server at ${API_CONFIG.baseUrl}. Make sure the backend is running.`;
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(', ') || fallback;
    }
    return fallback;
  }

  private hasStoredToken(): boolean {
    return Boolean(this.getToken());
  }
}
