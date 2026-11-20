import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface PublicUserProfile {
  id: number;
  username: string;
  full_name: string | null;
  profile_image_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${API_CONFIG.baseUrl}/users`;

  getPublicProfile(userId: number): Observable<PublicUserProfile> {
    return this.http.get<PublicUserProfile>(`${this.usersUrl}/${userId}`);
  }
}
