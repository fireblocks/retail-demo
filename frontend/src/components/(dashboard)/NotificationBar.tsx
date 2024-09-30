import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { Button } from '@/foundation/button';
import notificationStore from '@/store/notificationStore';
import authStore from '@/store/authStore'; 

const NotificationBar: React.FC = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const checkNotifications = useCallback(() => {
    if (authStore.user) {
      const userNotifications = notificationStore.getUserNotifications();
      setNotifications(userNotifications);
      setHasUnseenNotifications(userNotifications.length > 0 && !isOpen);
    }
  }, [isOpen, authStore.user]);

  useEffect(() => {
    checkNotifications();
  }, [checkNotifications]);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setHasUnseenNotifications(false);
    }
  };

  const formatNotificationBody = (body: string) => {
    return body.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.split(':').map((part, partIndex, parts) => {
          if (partIndex === 0 && parts.length > 1) {
            return <strong key={partIndex}>{part}:</strong>;
          }
          return <span key={partIndex}>{partIndex > 0 ? '' : ''}{part}</span>;
        })}
        {index < body.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (!authStore.user) {
    return null;
  }

  return (
    <div 
      style={{
        transition: 'width 0.5s ease-in-out',
        width: isOpen ? '32rem' : '2.5rem',
        maxWidth: '90vw'
      }}
      className={`fixed top-0 right-0 h-full bg-white shadow-lg shadow-primary border border-blue-200 border-y-0 z-50`}
    >
      <Button
        variant="ghost"
        className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-white shadow-md border border-blue-200"
        onClick={toggleOpen}
      >
        {isOpen ? <IconArrowRight /> : <IconArrowLeft />}
        {!isOpen && hasUnseenNotifications && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
        )}
      </Button>

      {isOpen && (
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-primary font-semibold">Notifications</h2>
            <Button 
              variant="ghost" 
              className='text-primary hover:bg-blue-100' 
              onClick={() => {
                notificationStore.clearAllNotifications();
                setNotifications([]);
              }}
            >
              Clear All
            </Button>
          </div>
          {[...notifications].reverse().map(notification => (
            <div key={notification.id} className="mb-4 p-2 bg-gray-100 rounded">
              <div className="flex justify-between items-start">
                <div className="w-full pr-2">
                  <h3 className="font-semibold text-primary">{notification.header}</h3>
                  <div className="font-sans text-sm mt-1 break-words">
                    {formatNotificationBody(notification.body)}
                  </div>
                  <small className="text-gray-500 block mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </small>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-shrink-0 ml-2" 
                  onClick={() => {
                    notificationStore.removeNotification(notification.id);
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                >
                  <IconX size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotificationBar;