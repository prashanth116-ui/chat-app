import { useState, useEffect, useCallback, useRef } from 'react';
import type { DirectMessageWithUser } from '@chat-app/shared';
import { conversations as conversationsApi } from '../services/api';
import { socketService } from '../services/socket';

export function useDMMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<DirectMessageWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const joinedRef = useRef(false);

  const loadMessages = useCallback(async (before?: string) => {
    if (!conversationId) return;
    try {
      if (!before) setIsLoading(true);
      const data = await conversationsApi.getMessages(conversationId, { limit: 50, before });
      if (before) {
        setMessages((prev) => [...data, ...prev]);
      } else {
        setMessages(data);
      }
      setHasMore(data.length === 50);
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Socket events
  useEffect(() => {
    if (!conversationId || !socketService.isConnected()) return;

    // Join conversation room
    if (!joinedRef.current) {
      socketService.emit('join_conversation', { conversationId });
      joinedRef.current = true;
    }

    const handleNewDM = (data: { conversationId: string; message: DirectMessageWithUser }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleDMEdited = (data: { conversationId: string; messageId: string; content: string; editedAt: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, content: data.content, editedAt: data.editedAt }
              : msg
          )
        );
      }
    };

    const handleDMDeleted = (data: { conversationId: string; messageId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, content: '[Message deleted]', deletedAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    const unsubNewDM = socketService.on('new_dm', handleNewDM);
    const unsubEdited = socketService.on('dm_edited', handleDMEdited);
    const unsubDeleted = socketService.on('dm_deleted', handleDMDeleted);

    return () => {
      unsubNewDM();
      unsubEdited();
      unsubDeleted();
      socketService.emit('leave_conversation', { conversationId });
      joinedRef.current = false;
    };
  }, [conversationId]);

  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      loadMessages(messages[0].createdAt);
    }
  }, [messages, hasMore, loadMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!conversationId) return;
      socketService.emit('send_dm', { conversationId, content });
    },
    [conversationId]
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!conversationId) return;
      socketService.emit('edit_dm', { conversationId, messageId, content });
    },
    [conversationId]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!conversationId) return;
      socketService.emit('delete_dm', { conversationId, messageId });
    },
    [conversationId]
  );

  const sendTyping = useCallback(() => {
    if (!conversationId) return;
    socketService.emit('dm_typing', { conversationId });
  }, [conversationId]);

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
  };
}
