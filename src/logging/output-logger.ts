import { Disposable } from 'vscode';
import { window } from 'vscode';
import { EXTENSION_NAME } from '../models/constants';

export class OutputLogger implements Disposable {

  private channel = window.createOutputChannel(EXTENSION_NAME);

  log(message: string): void  {
    if (message) {
      this.channel.appendLine(message);
    }
  }

  dispose(): void {
    this.channel.dispose();
  }
}
