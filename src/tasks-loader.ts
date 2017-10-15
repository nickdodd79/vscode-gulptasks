'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import * as utils from './utils';

export async function tasks(): Promise<string[]> {
  const emptyTasks: string[] = [];
  const workspaceRoot = vscode.workspace.rootPath;

  // Verify the workspace root
  if (!workspaceRoot) {
    return emptyTasks;
  }

  // Check gulp can be run
  try {
    await utils.exec('gulp -v', { cwd: workspaceRoot });
  } catch (err) {
    utils.showError('Unable to find an install of gulp. Try running \'npm i -g gulp\'.');
    return emptyTasks;
  }

  // Verify a gulp file exists
  const file = path.join(workspaceRoot, 'gulpfile.js');

  if (!await utils.exists(file)) {
    utils.outputInfo('No gulp file found in the current workspace.');
    return emptyTasks;
  }

  // Run the loader command to get a list of the gulp tasks
  utils.outputInfo('Loading gulp tasks ...');

  try {
    const output = await utils.exec('gulp --tasks-simple', { cwd: workspaceRoot });

    if (output.stderr) {
      utils.showError(output.stderr);
    } else {
      const tasks: string[] = [];

      if (output.stdout) {

        // The tasks are returned on separate lines from the output
        const lines = output.stdout.split(/\r{0,1}\n/);

        for (const line of lines) {
          if (line.length > 0) {
            tasks.push(line);
          }
        }
      }

      utils.outputInfo(`Loaded ${tasks.length} gulp tasks.`);

      return tasks;
    }
  } catch (err) {
    if (err.stderr) {
      utils.showError(err.stderr);
    }

    if (err.stdout) {
      utils.showError(err.stdout);
    }
  }

  return emptyTasks;
}
