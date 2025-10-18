import { Role } from "./role.enum";

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  details?: { [key: string]: string };
}