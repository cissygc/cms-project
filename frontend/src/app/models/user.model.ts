export interface User {
  id?: number;
  username: string;
  role: 'ADMIN' | 'EDITOR';
  token?: string;
  type?: string;
  postCount?: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface LoginPayload {
  username: string;
  password?: string;
}

export interface SignupPayload {
  username: string;
  password?: string;
  role: 'ADMIN' | 'EDITOR';
}
