import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserMeResponse,
  UserProfile,
} from '../models/auth.model';

const PROFILE_STORAGE_KEY = 'noteadda_user_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  username: '',
  email: '',
  university: '',
  course: '',
  role: 'buyer',
  bio: '',
  avatarUrl: '',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${API_CONFIG.baseUrl}/auth`;
  private readonly tokenKey = 'noteadda_access_token';

  readonly isAuthenticated = signal<boolean>(this.hasStoredToken());
  readonly userProfile = signal<UserProfile>(this.loadStoredProfile());

  constructor() {
    if (this.isAuthenticated()) {
      this.fetchCurrentUser().subscribe({ error: () => {} });
    }
  }

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
        this.fetchCurrentUser().subscribe({ error: () => {} });
      }),
    );
  }

  fetchCurrentUser(): Observable<UserMeResponse> {
    return this.http.get<UserMeResponse>(`${API_CONFIG.baseUrl}/users/me`).pipe(
      tap((user) => this.applyUserMe(user)),
    );
  }

  uploadProfileImage(file: File): Observable<UserMeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<UserMeResponse>(`${API_CONFIG.baseUrl}/users/me/profile-image`, formData).pipe(
      tap((user) => this.applyUserMe(user)),
    );
  }

  deleteProfileImage(): Observable<UserMeResponse> {
    return this.http.delete<UserMeResponse>(`${API_CONFIG.baseUrl}/users/me/profile-image`).pipe(
      tap((user) => this.applyUserMe(user)),
    );
  }

  private applyUserMe(user: UserMeResponse): void {
    const current = this.userProfile();
    const resolvedAvatarUrl =
      user.profile_image_url !== undefined
        ? (user.profile_image_url ?? '')
        : (user.avatar_url ?? current.avatarUrl);

    const merged: UserProfile = {
      ...current,
      id: user.id,
      fullName: user.full_name?.trim() || user.username,
      username: user.username,
      email: user.email,
      avatarUrl: resolvedAvatarUrl,
      university: user.university ?? current.university,
      course: user.course ?? current.course,
      role: user.role ?? current.role,
      bio: user.bio ?? current.bio,
    };
    this.updateProfile(merged);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    this.userProfile.set({ ...DEFAULT_PROFILE });
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  updateProfile(profile: UserProfile): void {
    this.userProfile.set(profile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }

  private loadStoredProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<UserProfile>) };
      }
    } catch {
      // Ignore invalid JSON
    }
    return { ...DEFAULT_PROFILE };
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
