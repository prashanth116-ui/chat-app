import type { AuthResponse, RegisterRequest, LoginRequest } from '@chat-app/shared';
import { Gender } from '@chat-app/shared';
import * as UserModel from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken, signRefreshToken } from '../utils/jwt.js';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // Check if email already exists
  if (await UserModel.emailExists(data.email)) {
    throw new AuthError('Email already registered', 409);
  }

  // Check if username already exists
  if (await UserModel.usernameExists(data.username)) {
    throw new AuthError('Username already taken', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await UserModel.createUser({
    email: data.email,
    passwordHash,
    username: data.username,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    countryId: data.countryId,
    stateId: data.stateId,
  });

  // Generate tokens
  const accessToken = signToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  return { user, accessToken, refreshToken };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const user = await UserModel.findUserByEmail(data.email);

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isValidPassword = await verifyPassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AuthError('Invalid email or password', 401);
  }

  // Update last seen
  await UserModel.updateLastSeen(user.id);

  // Generate tokens
  const accessToken = signToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  // Remove passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  return { accessToken, refreshToken };
}

interface GuestLoginData {
  gender: Gender;
  countryId: number;
  stateId?: number;
}

export async function guestLogin(data: GuestLoginData): Promise<AuthResponse> {
  // Generate unique guest identifiers
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const guestEmail = `${guestId}@guest.local`;
  const guestUsername = `Guest_${Math.random().toString(36).substring(2, 8)}`;

  // Create a random password hash (guest can't login with password)
  const passwordHash = await hashPassword(Math.random().toString(36));

  // Create guest user with provided gender and location
  const user = await UserModel.createUser({
    email: guestEmail,
    passwordHash,
    username: guestUsername,
    gender: data.gender,
    dateOfBirth: '2000-01-01', // Default date for guests (meets age requirement)
    countryId: data.countryId,
    stateId: data.stateId,
  });

  // Generate tokens
  const accessToken = signToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  return { user, accessToken, refreshToken };
}
