import { Disposable } from 'vscode';

type ErrorCallback = (err?: Error) => void;
type ProcessTerminator = () => Promise<void>;

export class Task implements Disposable {

  private terminator: ProcessTerminator;

  constructor(private readonly executor: (callback: ErrorCallback) => ProcessTerminator) { }

  execute(): Promise<void> {

    // Resolve immediately if no executor is defined or the task is already running
    if (!this.executor || this.terminator) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {

      // Execute the task process and resolve the promise appropriately
      // Track the process instance to terminate later
      this.terminator = this.executor(err => err ? reject(err) : resolve());
    });
  }

  terminate(): Promise<void> {

    // If no process then resolve immediately
    if (!this.terminator) {
      return Promise.resolve();
    }

    // Otherwise invoke the process termination
    const promise = this.terminator();
    return promise.then(() => this.terminator = undefined);
  }

  dispose(): void {
    this.terminate();
  }
}
