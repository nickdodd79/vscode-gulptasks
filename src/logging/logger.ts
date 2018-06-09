import { Disposable } from 'vscode';
import { AlertLogger } from './alert-logger';
import { OutputLogger } from './output-logger';

export class Logger implements Disposable {

  readonly alert = new AlertLogger();
  readonly output = new OutputLogger();

  info(message: string): void {
    this.alert.info(message);
    this.output.log(message);
  }

  warn(message: string): void {
    this.alert.warn(message);

    if (message) {
      this.output.log(`WARNING: ${message}`);
    }
  }

  error(message: string): void {
    this.alert.error(message);

    if (message) {
      this.output.log(`ERROR: ${message}`);
    }
  }

  dispose(): void {
    this.output.dispose();
  }
}
