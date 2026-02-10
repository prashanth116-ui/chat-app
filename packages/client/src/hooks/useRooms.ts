import { useState, useEffect, useCallback } from 'react';
import type { RoomWithDetails, Country, State } from '@chat-app/shared';
import { rooms as roomsApi, locations } from '../services/api';

export function useRooms(options?: { countryId?: number; stateId?: number }) {
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roomsApi.list(options);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  }, [options?.countryId, options?.stateId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, isLoading, error, refetch: fetchRooms };
}

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<RoomWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setIsLoading(false);
      return;
    }

    const id = roomId;
    async function fetchRoom() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await roomsApi.get(id);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoom();
  }, [roomId]);

  return { room, isLoading, error };
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        setIsLoading(true);
        const data = await locations.getCountries();
        setCountries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load countries');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
}

export function useStates(countryId: number | undefined) {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }

    const id = countryId;
    async function fetchStates() {
      try {
        setIsLoading(true);
        const data = await locations.getStates(id);
        setStates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load states');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStates();
  }, [countryId]);

  return { states, isLoading, error };
}
