import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { Card, Button, Spinner } from '../components/ui';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    if (currentUser) {
      setIsLoading(true);
      const userNotifications = notificationService.getNotifications(currentUser.id);
      setNotifications(userNotifications);
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    if (currentUser) {
      notificationService.markAsRead(currentUser.id, notificationId);
      fetchNotifications(); // Re-fetch to update UI
    }
  };

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id);
      fetchNotifications(); // Re-fetch to update UI
    }
  };
  
  const getNotificationLink = (notification: NotificationItem): string | null => {
    if (notification.type === 'new_inquiry' && notification.relatedEntityId) {
        return '/manufacturer';
    }
    if (notification.type === 'inquiry_response' && notification.relatedEntityId) {
        return '/client';
    }
    if ((notification.type === 'turnkey_project_update' || notification.type === 'turnkey_project_created') && notification.relatedEntityId) {
        return `/project/${notification.relatedEntityId}`;
    }
    return null;
  }

  if (isLoading) {
    return <div className="text-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <Card title="Ваши уведомления">
      {notifications.length === 0 ? (
        <p className="text-gray-500">У вас пока нет уведомлений.</p>
      ) : (
        <>
          <div className="mb-4 text-right">
            <Button onClick={handleMarkAllAsRead} variant="secondary" size="sm" disabled={notifications.every(n => n.isRead)}>
              Отметить все как прочитанные
            </Button>
          </div>
          <ul className="space-y-3">
            {notifications.map(notification => {
              const link = getNotificationLink(notification);
              return (
                <li
                  key={notification.id}
                  className={`p-4 rounded-md border ${
                    notification.isRead ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 font-semibold'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      {link ? (
                        <Link to={link} className="hover:underline text-black">
                           {notification.message}
                        </Link>
                      ) : (
                        <span className="text-black">{notification.message}</span>
                      )}
                      <p className={`text-xs mt-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(notification.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="outline"
                        size="sm"
                        className="ml-4 flex-shrink-0"
                      >
                        Прочитано
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
};
