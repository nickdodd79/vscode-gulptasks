import { Notifications } from './notifications';

export interface Settings {
  pattern: string;
  filters: string[];
  args: string[];
  notifications: Notifications;
}
