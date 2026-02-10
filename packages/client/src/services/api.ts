import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
  UserPublic,
  UpdateProfileRequest,
  Room,
  RoomWithDetails,
  CreateRoomRequest,
  MessageWithUser,
  Country,
  State,
} from '@chat-app/shared';

const API_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status, data.details);
  }

  return data;
}

// Auth API
export const auth = {
  register: (data: RegisterRequest) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getMe: () => request<User>('/api/auth/me'),
};

// Users API
export const users = {
  getMe: () => request<User>('/api/users/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    request<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUser: (id: string) => request<UserPublic>(`/api/users/${id}`),
};

// Rooms API
export const rooms = {
  list: (params?: { countryId?: number; stateId?: number; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.countryId) searchParams.set('countryId', String(params.countryId));
    if (params?.stateId) searchParams.set('stateId', String(params.stateId));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return request<RoomWithDetails[]>(`/api/rooms${query ? `?${query}` : ''}`);
  },

  get: (id: string) => request<RoomWithDetails>(`/api/rooms/${id}`),

  create: (data: CreateRoomRequest) =>
    request<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByCountry: (code: string) => request<RoomWithDetails[]>(`/api/rooms/country/${code}`),

  getOnlineUsers: (roomId: string) => request<UserPublic[]>(`/api/rooms/${roomId}/users`),
};

// Messages API
export const messages = {
  getByRoom: (roomId: string, params?: { limit?: number; offset?: number; before?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.before) searchParams.set('before', params.before);
    const query = searchParams.toString();
    return request<MessageWithUser[]>(`/api/rooms/${roomId}/messages${query ? `?${query}` : ''}`);
  },
};

// Locations API
export const locations = {
  getCountries: () => request<Country[]>('/api/rooms/locations/countries'),

  getStates: (countryId: number) => request<State[]>(`/api/rooms/locations/countries/${countryId}/states`),
};

export { ApiError };
