import { makeAutoObservable, runInAction } from 'mobx';

class NotificationStore {
  notifications: { id: string; message: string; timestamp: number }[] = [];

  constructor() {
    makeAutoObservable(this);
    this.loadNotifications();
  }

  loadNotifications() {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        runInAction(() => {
          this.notifications = JSON.parse(storedNotifications);
        });
      }
    }
  }

  saveNotifications() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
  }

  addNotification(message: string) {
    const newNotification = {
      id: Date.now().toString(),
      message,
      timestamp: Date.now(),
    };
    runInAction(() => {
      this.notifications.unshift(newNotification);
      this.saveNotifications();
    });
  }

  removeNotification(id: string) {
    runInAction(() => {
      this.notifications = this.notifications.filter(notification => notification.id !== id);
      this.saveNotifications();
    });
  }

  clearAllNotifications() {
    runInAction(() => {
      this.notifications = [];
      this.saveNotifications();
    });
  }
}

const notificationStore = new NotificationStore();
export default notificationStore;