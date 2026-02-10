import { useState, useEffect, useCallback } from 'react';
import type { UserPublic, FriendWithUser, FriendshipStatusResponse } from '@chat-app/shared';
import { friends as friendsApi } from '../services/api';

export function useFriends() {
  const [friends, setFriends] = useState<UserPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await friendsApi.list();
      setFriends(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return { friends, isLoading, error, refresh: loadFriends };
}

export function useFriendRequests() {
  const [requests, setRequests] = useState<FriendWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await friendsApi.getRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friend requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const accept = async (friendshipId: string) => {
    await friendsApi.acceptRequest(friendshipId);
    loadRequests();
  };

  const decline = async (friendshipId: string) => {
    await friendsApi.declineRequest(friendshipId);
    loadRequests();
  };

  return { requests, isLoading, error, accept, decline, refresh: loadRequests };
}

export function useSentRequests() {
  const [requests, setRequests] = useState<FriendWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await friendsApi.getSentRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sent requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const cancel = async (friendshipId: string) => {
    await friendsApi.cancelRequest(friendshipId);
    loadRequests();
  };

  return { requests, isLoading, error, cancel, refresh: loadRequests };
}

export function useFriendshipStatus(userId: string | undefined) {
  const [status, setStatus] = useState<FriendshipStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await friendsApi.getStatus(userId);
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return { status, isLoading, refresh: loadStatus };
}

export function useBlockedUsers() {
  const [blocked, setBlocked] = useState<UserPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlocked = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await friendsApi.getBlocked();
      setBlocked(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocked users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocked();
  }, [loadBlocked]);

  const unblock = async (userId: string) => {
    await friendsApi.unblock(userId);
    loadBlocked();
  };

  return { blocked, isLoading, error, unblock, refresh: loadBlocked };
}
