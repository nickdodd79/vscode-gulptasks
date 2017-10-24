'use strict';

import * as cp from 'child_process';
import * as utils from './utils';

export interface TaskContext {
  command: string;
  workingDirectory: string;
}

const _cache: { [id: string]: cp.ChildProcess } = {};

export async function execute(context: TaskContext): Promise<void> {
  if (context && !_cache[context.command]) {
    utils.outputInfo(`Executing '${context.command}' ...`);

    const process = cp.exec(context.command, { cwd: context.workingDirectory }, (error, stdout, stderr) => {
      if (stderr) {
        utils.showError(stderr);
      } else {

        // Output the gulp process messages
        const lines = stdout.split(/\r{0,1}\n/);

        for (const line of lines) {
          if (line.length > 0) {
            utils.outputLog(line);
          }
        }

        utils.showInfo(`The execution of '${context.command}' completed successfully.`, `Executed '${context.command}'.`);

        // Clear the cached process - it has completed and so cannot be terminated
        _cache[context.command] = undefined;
      }
    });

    // Cache the process for termination
    _cache[context.command] = process;
  }
}

export function terminate(context: TaskContext): void {
  if (context) {
    const process = _cache[context.command];

    if (process) {

      // Subscribe to the exit event to ensure the process has been terminated
      // Then provide a message indicating it has been terminated
      process.on('exit', () => utils.showInfo(`The termination of '${context.command}' completed successfully.`, `Terminated '${context.command}'.`));
      process.kill();

      // Clear the cache to avoid multiple terminatation requests
      _cache[context.command] = undefined;
    }
  }
}
