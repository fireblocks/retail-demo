import { makeAutoObservable, runInAction } from 'mobx';
import authStore from './authStore';

interface Notification {
  id: string;
  header: string;
  body: string;
  timestamp: number;
}

class NotificationStore {
  private notifications: Notification[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  private getStorageKey(): string {
    return `userNotifications_${authStore.user?.id}`;
  }

  private loadNotificationsFromStorage() {
    if (authStore.user?.id) {
      const storedNotifications = localStorage.getItem(this.getStorageKey());
      if (storedNotifications) {
        runInAction(() => {
          this.notifications = JSON.parse(storedNotifications);
        });
      } else {
        runInAction(() => {
          this.notifications = [];
        });
      }
    }
  }

  private saveNotificationsToStorage() {
    if (authStore.user?.id) {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.notifications));
    }
  }

  addNotification(header: string, body: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      header,
      body,
      timestamp: Date.now(),
    };

    runInAction(() => {
      this.notifications.push(notification);
    });
    this.saveNotificationsToStorage();
  }

  removeNotification(id: string) {
    runInAction(() => {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== id
      );
    });
    this.saveNotificationsToStorage();
  }

  clearAllNotifications() {
    runInAction(() => {
      this.notifications = [];
    });
    this.saveNotificationsToStorage();
  }

  getUserNotifications(): Notification[] {
    this.loadNotificationsFromStorage();
    return this.notifications;
  }
}

const notificationStore = new NotificationStore();
export default notificationStore;