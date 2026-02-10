import type { Room, RoomWithDetails, CreateRoomRequest } from '@chat-app/shared';
import * as RoomModel from '../models/Room.js';
import { getOnlineUsers } from '../config/redis.js';
import { getPublicUsersByIds } from '../models/User.js';

export async function createRoom(data: CreateRoomRequest, userId: string): Promise<Room> {
  return RoomModel.createRoom({
    ...data,
    createdBy: userId,
  });
}

export async function getRoomById(id: string): Promise<Room | null> {
  return RoomModel.findRoomById(id);
}

export async function getRoomWithDetails(id: string): Promise<RoomWithDetails | null> {
  const room = await RoomModel.getRoomWithDetails(id);

  if (room) {
    // Get online count from Redis
    const onlineUserIds = await getOnlineUsers(id);
    room.onlineCount = onlineUserIds.length;
  }

  return room;
}

export async function getRooms(options: {
  countryId?: number;
  stateId?: number;
  limit?: number;
  offset?: number;
}): Promise<RoomWithDetails[]> {
  const rooms = await RoomModel.getRoomsWithDetails(options);

  // Get online counts from Redis for each room
  await Promise.all(
    rooms.map(async (room) => {
      const onlineUserIds = await getOnlineUsers(room.id);
      room.onlineCount = onlineUserIds.length;
    })
  );

  return rooms;
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const room = await RoomModel.findRoomById(roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  await RoomModel.addRoomMember(roomId, userId, 'member');
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  await RoomModel.removeRoomMember(roomId, userId);
}

export async function isUserInRoom(roomId: string, userId: string): Promise<boolean> {
  return RoomModel.isRoomMember(roomId, userId);
}

export async function getOnlineUsersInRoom(roomId: string) {
  const onlineUserIds = await getOnlineUsers(roomId);
  return getPublicUsersByIds(onlineUserIds);
}
