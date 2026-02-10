export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface User {
  id: string;
  email: string;
  username: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string
  ageVerified: boolean;
  countryId: number | null;
  stateId: number | null;
  avatarUrl: string | null;
  createdAt: string;
  lastSeen: string;
}

export interface UserPublic {
  id: string;
  username: string;
  gender: Gender;
  avatarUrl: string | null;
  countryId: number | null;
  stateId: number | null;
  lastSeen: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  countryId?: number;
  stateId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
  gender?: Gender;
  countryId?: number;
  stateId?: number;
}

export const MIN_AGE = 16;

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function isValidAge(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) >= MIN_AGE;
}
