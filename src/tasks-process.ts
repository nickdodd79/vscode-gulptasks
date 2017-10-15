'use strict';

import * as cp from 'child_process';
import * as utils from './utils';

const _cache: { [id: string]: cp.ChildProcess } = {};

export async function execute(task: string, workspaceRoot: string | undefined): Promise<void> {
  if (task && workspaceRoot && !_cache[task]) {
    utils.outputInfo(`Executing '${task}' ...`);

    const process = cp.exec(task, { cwd: workspaceRoot }, (error, stdout, stderr) => {
      if (stderr) {
        utils.showError(stderr);
      } else {
        utils.showInfo(`The execution of '${task}' completed successfully.`, `Executed '${task}'.`);

        // Clear the cached process - it has completed and so cannot be terminated
        _cache[task] = undefined;
      }
    });

    // Cache the process for termination
    _cache[task] = process;
  }
}

export function terminate(task: string): void {
  const process = _cache[task];

  if (process) {

    // Subscribe to the exit event to ensure the process has been terminated
    // Then provide a message indicating it has been terminated
    process.on('exit', () => utils.showInfo(`The termination of '${task}' completed successfully.`, `Terminated '${task}'.`));
    process.kill();

    // Clear the cache to avoid multiple terminatation requests
    _cache[task] = undefined;
  }
}
