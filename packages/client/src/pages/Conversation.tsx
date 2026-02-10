import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConversation } from '../hooks/useConversations';
import { useDMMessages } from '../hooks/useDM';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from '../components/user/UserAvatar';
import { GenderIcon } from '../components/user/GenderIcon';
import { Button } from '../components/common/Button';
import styles from './Conversation.module.css';

export function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { conversation, isLoading: convLoading } = useConversation(conversationId);
  const {
    messages,
    isLoading: msgsLoading,
    hasMore,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
  } = useDMMessages(conversationId);

  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTyping();
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    editMessage(editingId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (convLoading || msgsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Conversation not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/messages" className={styles.back}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <UserAvatar
          username={conversation.otherUser.username}
          avatarUrl={conversation.otherUser.avatarUrl}
          size="sm"
        />
        <span className={styles.username}>
          <GenderIcon gender={conversation.otherUser.gender} size="sm" />
          {conversation.otherUser.username}
        </span>
      </div>

      <div className={styles.messages}>
        {hasMore && (
          <button className={styles.loadMore} onClick={loadMore}>
            Load earlier messages
          </button>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          const isDeleted = !!msg.deletedAt;

          return (
            <div
              key={msg.id}
              className={`${styles.message} ${isOwn ? styles.own : ''} ${isDeleted ? styles.deleted : ''}`}
            >
              {!isOwn && (
                <UserAvatar
                  username={msg.sender?.username || 'Deleted'}
                  avatarUrl={msg.sender?.avatarUrl || null}
                  size="sm"
                />
              )}
              <div className={styles.messageContent}>
                {editingId === msg.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editInput}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.text}>{msg.content}</p>
                    <div className={styles.meta}>
                      <span className={styles.time}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.editedAt && <span className={styles.edited}>(edited)</span>}
                    </div>
                  </>
                )}
                {isOwn && !isDeleted && editingId !== msg.id && (
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEdit(msg.id, msg.content)}
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => deleteMessage(msg.id)}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className={styles.input}
        />
        <Button type="submit" disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
