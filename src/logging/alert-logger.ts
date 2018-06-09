import { window } from 'vscode';
import { EXTENSION_NAME } from '../models/constants';

export class AlertLogger {

  info(message: string): void {
    if (message) {
      window.showInformationMessage(`${EXTENSION_NAME}: ${message}`);
    }
  }

  warn(message: string): void {
    if (message) {
      window.showWarningMessage(`${EXTENSION_NAME}: ${message}`);
    }
  }

  error(message: string): void {
    if (message) {
      window.showErrorMessage(`${EXTENSION_NAME}: ${message}`);
    }
  }
}
