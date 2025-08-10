
import { NotificationItem, UserRole } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'appNotifications';

interface StoredNotifications {
  [userId: string]: NotificationItem[];
}

const getAllStoredNotifications = (): StoredNotifications => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse notifications from localStorage", e);
    return {};
  }
};

const saveNotifications = (notifications: StoredNotifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (e) {
    console.error("Failed to save notifications to localStorage", e);
  }
};

export const notificationService = {
  addNotification: (
    userId: string,
    message: string,
    type: NotificationItem['type'],
    relatedEntityId?: string,
    relatedEntityName?: string
  ): NotificationItem => {
    const allNotifications = getAllStoredNotifications();
    const userNotifications = allNotifications[userId] || [];

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message,
      type,
      relatedEntityId,
      relatedEntityName,
      timestamp: new Date(),
      isRead: false,
    };

    userNotifications.unshift(newNotification); 
    allNotifications[userId] = userNotifications;
    saveNotifications(allNotifications);
    return newNotification;
  },

  getNotifications: (userId: string): NotificationItem[] => {
    const allNotifications = getAllStoredNotifications();
    return (allNotifications[userId] || []).map(n => ({...n, timestamp: new Date(n.timestamp) })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  getUnreadNotifications: (userId: string): NotificationItem[] => {
    return notificationService.getNotifications(userId).filter(n => !n.isRead);
  },

  markAsRead: (userId: string, notificationId: string): boolean => {
    const allNotifications = getAllStoredNotifications();
    const userNotifications = allNotifications[userId];
    if (!userNotifications) return false;

    const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) return false;

    userNotifications[notificationIndex].isRead = true;
    allNotifications[userId] = userNotifications;
    saveNotifications(allNotifications);
    return true;
  },

  markAllAsRead: (userId: string): void => {
    const allNotifications = getAllStoredNotifications();
    const userNotifications = allNotifications[userId];
    if (!userNotifications) return;

    userNotifications.forEach(n => n.isRead = true);
    allNotifications[userId] = userNotifications;
    saveNotifications(allNotifications);
  },

  clearNotifications: (userId: string): void => { 
    const allNotifications = getAllStoredNotifications();
    delete allNotifications[userId];
    saveNotifications(allNotifications);
  },
};
