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
  Friendship,
  FriendWithUser,
  FriendshipStatusResponse,
  Conversation,
  ConversationWithUser,
  DirectMessageWithUser,
  Attachment,
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

  guest: () =>
    request<AuthResponse>('/api/auth/guest', {
      method: 'POST',
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

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  search: (q: string) => request<UserPublic[]>(`/api/users/search?q=${encodeURIComponent(q)}`),

  getUser: (id: string) => request<UserPublic>(`/api/users/${id}`),

  // GDPR
  exportData: () => request<unknown>('/api/users/me/export'),

  getDeletionStatus: () =>
    request<{ isScheduled: boolean; scheduledAt: string | null }>('/api/users/me/deletion'),

  requestDeletion: (password: string, confirmation: string) =>
    request<{ scheduledAt: string }>('/api/users/me/delete', {
      method: 'POST',
      body: JSON.stringify({ password, confirmation }),
    }),

  cancelDeletion: () =>
    request<{ message: string }>('/api/users/me/delete', { method: 'DELETE' }),
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

// Conversations API
export const conversations = {
  list: () => request<ConversationWithUser[]>('/api/conversations'),

  getOrCreate: (userId: string) =>
    request<Conversation>(`/api/conversations/with/${userId}`, { method: 'POST' }),

  get: (conversationId: string) =>
    request<ConversationWithUser>(`/api/conversations/${conversationId}`),

  getMessages: (conversationId: string, params?: { limit?: number; before?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.before) searchParams.set('before', params.before);
    const query = searchParams.toString();
    return request<DirectMessageWithUser[]>(
      `/api/conversations/${conversationId}/messages${query ? `?${query}` : ''}`
    );
  },

  sendMessage: (conversationId: string, content: string) =>
    request<DirectMessageWithUser>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  editMessage: (conversationId: string, messageId: string, content: string) =>
    request<DirectMessageWithUser>(
      `/api/conversations/${conversationId}/messages/${messageId}`,
      { method: 'PUT', body: JSON.stringify({ content }) }
    ),

  deleteMessage: (conversationId: string, messageId: string) =>
    request<{ message: string }>(
      `/api/conversations/${conversationId}/messages/${messageId}`,
      { method: 'DELETE' }
    ),
};

// Friends API
export const friends = {
  list: () => request<UserPublic[]>('/api/friends'),

  getRequests: () => request<FriendWithUser[]>('/api/friends/requests'),

  getSentRequests: () => request<FriendWithUser[]>('/api/friends/requests/sent'),

  getStatus: (userId: string) => request<FriendshipStatusResponse>(`/api/friends/status/${userId}`),

  sendRequest: (userId: string) =>
    request<Friendship>(`/api/friends/request/${userId}`, { method: 'POST' }),

  acceptRequest: (friendshipId: string) =>
    request<Friendship>(`/api/friends/${friendshipId}/accept`, { method: 'PUT' }),

  declineRequest: (friendshipId: string) =>
    request<{ message: string }>(`/api/friends/${friendshipId}/decline`, { method: 'DELETE' }),

  cancelRequest: (friendshipId: string) =>
    request<{ message: string }>(`/api/friends/${friendshipId}/cancel`, { method: 'DELETE' }),

  remove: (friendshipId: string) =>
    request<{ message: string }>(`/api/friends/${friendshipId}`, { method: 'DELETE' }),

  block: (userId: string) =>
    request<{ message: string }>(`/api/friends/block/${userId}`, { method: 'POST' }),

  unblock: (userId: string) =>
    request<{ message: string }>(`/api/friends/block/${userId}`, { method: 'DELETE' }),

  getBlocked: () => request<UserPublic[]>('/api/friends/blocked'),

  isBlocked: (userId: string) => request<{ isBlocked: boolean }>(`/api/friends/block/${userId}`),
};

// Uploads API
export const uploads = {
  getStatus: () => request<{ enabled: boolean }>('/api/uploads/status'),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/uploads/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status);
    }
    return data as { url: string };
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/uploads/file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status);
    }
    return data as Attachment;
  },

  deleteAttachment: (attachmentId: string) =>
    request<{ message: string }>(`/api/uploads/${attachmentId}`, { method: 'DELETE' }),
};

export { ApiError };
