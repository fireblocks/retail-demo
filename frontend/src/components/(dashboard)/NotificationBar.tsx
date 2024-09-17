import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { Button } from '@/foundation/button';
import notificationStore from '@/store/notificationStore';

const NotificationBar: React.FC = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  useEffect(() => {
    if (notificationStore.notifications.length > 0 && !isOpen) {
      setHasUnseenNotifications(true);
    }
  }, [notificationStore.notifications.length, isOpen]);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setHasUnseenNotifications(false);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-white shadow-lg shadow-primary border border-blue-200 border-y-0 transition-all duration-300 z-50 ${isOpen ? 'w-full sm:w-80' : 'w-10'}`}>
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
        <div className="p-4 h-full overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-primary font-semibold">Notifications</h2>
            <Button variant="ghost" className='text-primary hover:bg-blue-100' onClick={() => notificationStore.clearAllNotifications()}>Clear All</Button>
          </div>
          {notificationStore.notifications.map(notification => (
            <div key={notification.id} className="mb-4 p-2 bg-gray-100 rounded max-w-full">
              <div className="flex justify-between items-start">
                <p className="break-all pr-2 flex-grow overflow-hidden">{notification.message}</p>
                <Button variant="ghost" size="sm" className="flex-shrink-0 ml-2" onClick={() => notificationStore.removeNotification(notification.id)}>
                  <IconX size={16} />
                </Button>
              </div>
              <small className="text-gray-500 block mt-1 break-all">
                {new Date(notification.timestamp).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotificationBar;