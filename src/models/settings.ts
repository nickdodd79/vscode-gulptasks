import { Output } from './output';
import { Notifications } from './notifications';

export interface Settings {
  pattern: string;
  filters: string[];
  args: string[];
  output: Output;
  notifications: Notifications;
}
