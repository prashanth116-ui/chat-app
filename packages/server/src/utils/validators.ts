import { z } from 'zod';
import { Gender, MIN_AGE, calculateAge } from '@chat-app/shared';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => calculateAge(date) >= MIN_AGE,
      `You must be at least ${MIN_AGE} years old to register`
    ),
  countryId: z.number().int().positive().optional(),
  stateId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatarUrl: z.string().url().optional(),
  countryId: z.number().int().positive().optional(),
  stateId: z.number().int().positive().optional(),
});

export const createRoomSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  countryId: z.number().int().positive().optional(),
  stateId: z.number().int().positive().optional(),
  isPrivate: z.boolean().default(false),
  maxUsers: z.number().int().min(2).max(1000).default(100),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
