import { useState, useEffect, useCallback } from 'react';
import type { ConversationWithUser } from '@chat-app/shared';
import { conversations as conversationsApi } from '../services/api';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await conversationsApi.list();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return { conversations, isLoading, error, refresh: loadConversations };
}

export function useConversation(conversationId: string | undefined) {
  const [conversation, setConversation] = useState<ConversationWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      setIsLoading(true);
      const data = await conversationsApi.get(conversationId);
      setConversation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return { conversation, isLoading, error, refresh: loadConversation };
}
