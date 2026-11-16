export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name: string | null;
}

export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserMeResponse {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active?: boolean;
  created_at?: string;
  avatar_url?: string | null;
  university?: string | null;
  course?: string | null;
  role?: 'buyer' | 'seller' | 'both' | null;
  bio?: string | null;
}

export interface UserProfile {
  id?: number;
  fullName: string;
  username: string;
  email: string;
  university: string;
  course: string;
  role: 'buyer' | 'seller' | 'both';
  bio: string;
  avatarUrl: string;
}
