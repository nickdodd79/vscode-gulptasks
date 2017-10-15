'use strict';

import * as utils from './utils';

export async function executeTask(task: string, workspaceRoot: string | undefined): Promise<void> {
  if (workspaceRoot && task) {
    utils.outputInfo(`Executing '${task}' ...`);

    try {
      const output = await utils.exec(task, { cwd: workspaceRoot });

      if (output.stderr) {
        utils.showError(output.stderr);
      } else {
        utils.showInfo(`The execution of '${task}' completed successfully.`, `Executed '${task}'.`);
        return;
      }
    } catch (err) {
      if (err.stderr) {
        utils.showError(err.stderr);
      }

      if (err.stdout) {
        utils.showError(err.stdout);
      }
    }
  }
}
