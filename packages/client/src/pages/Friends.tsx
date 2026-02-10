import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserPublic } from '@chat-app/shared';
import { useFriends, useFriendRequests, useSentRequests, useBlockedUsers } from '../hooks/useFriends';
import { friends as friendsApi } from '../services/api';
import { UserSearch } from '../components/user/UserSearch';
import { FriendList } from '../components/friends/FriendList';
import { FriendRequests, SentRequests } from '../components/friends/FriendRequests';
import { UserAvatar } from '../components/user/UserAvatar';
import { GenderIcon } from '../components/user/GenderIcon';
import { Button } from '../components/common/Button';
import styles from './Friends.module.css';

type Tab = 'friends' | 'requests' | 'sent' | 'blocked';

export function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchError, setSearchError] = useState<string | null>(null);

  const {
    friends,
    isLoading: friendsLoading,
    refresh: refreshFriends,
  } = useFriends();

  const {
    requests,
    isLoading: requestsLoading,
    accept,
    decline,
    refresh: refreshRequests,
  } = useFriendRequests();

  const {
    requests: sentRequests,
    isLoading: sentLoading,
    cancel,
    refresh: refreshSent,
  } = useSentRequests();

  const {
    blocked,
    isLoading: blockedLoading,
    unblock,
  } = useBlockedUsers();

  const handleAddFriend = async (user: UserPublic) => {
    setSearchError(null);
    try {
      await friendsApi.sendRequest(user.id);
      refreshSent();
      refreshRequests();
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to send friend request');
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    const friend = friends.find((f) => f.id === userId);
    if (!friend) return;

    try {
      const status = await friendsApi.getStatus(userId);
      if (status.friendshipId) {
        await friendsApi.remove(status.friendshipId);
        refreshFriends();
      }
    } catch {
      // Ignore errors
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  const handleAccept = async (friendshipId: string) => {
    await accept(friendshipId);
    refreshFriends();
  };

  const handleDecline = async (friendshipId: string) => {
    await decline(friendshipId);
  };

  const handleCancel = async (friendshipId: string) => {
    await cancel(friendshipId);
  };

  const handleUnblock = async (userId: string) => {
    await unblock(userId);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'sent', label: 'Sent', count: sentRequests.length },
    { id: 'blocked', label: 'Blocked', count: blocked.length },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Friends</h1>

      <div className={styles.search}>
        <UserSearch onSelect={handleAddFriend} placeholder="Search users to add..." />
        {searchError && <div className={styles.searchError}>{searchError}</div>}
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={styles.badge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'friends' && (
          <FriendList
            friends={friends}
            onRemove={handleRemoveFriend}
            onMessage={handleMessage}
            isLoading={friendsLoading}
          />
        )}

        {activeTab === 'requests' && (
          <FriendRequests
            requests={requests}
            onAccept={handleAccept}
            onDecline={handleDecline}
            isLoading={requestsLoading}
          />
        )}

        {activeTab === 'sent' && (
          <SentRequests
            requests={sentRequests}
            onCancel={handleCancel}
            isLoading={sentLoading}
          />
        )}

        {activeTab === 'blocked' && (
          <div className={styles.blockedList}>
            {blockedLoading ? (
              <div className={styles.loading}>Loading blocked users...</div>
            ) : blocked.length === 0 ? (
              <div className={styles.empty}>No blocked users</div>
            ) : (
              blocked.map((user) => (
                <div key={user.id} className={styles.blockedItem}>
                  <div className={styles.info}>
                    <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="md" />
                    <span className={styles.username}>
                      <GenderIcon gender={user.gender} size="sm" />
                      {user.username}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUnblock(user.id)}>
                    Unblock
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
