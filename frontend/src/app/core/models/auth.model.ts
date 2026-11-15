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
