'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as utils from './utils';

function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    fs.exists(file, value => {
      resolve(value);
    });
  });
}

function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      }

      resolve({ stdout, stderr });
    });
  });
}

export async function tasks(): Promise<string[]> {
  const emptyTasks: string[] = [];
  const workspaceRoot = vscode.workspace.rootPath;

  // Verify the workspace root
  if (!workspaceRoot) {
    return emptyTasks;
  }

  // Check gulp can be run
  try {
    await exec('gulp -v', { cwd: workspaceRoot });
  } catch (err) {
    utils.showError('Unable to find an install of gulp. Try running \'npm i -g gulp\'.');
    return emptyTasks;
  }

  // Verify a gulp file exists
  const file = path.join(workspaceRoot, 'gulpfile.js');

  if (!await exists(file)) {
    utils.outputInfo('No gulp file found in the current workspace.');
    return emptyTasks;
  }

  // Run the loader command to get a list of the gulp tasks
  utils.outputInfo('Loading gulp tasks ...');

  try {
    const output = await exec('gulp --tasks-simple', { cwd: workspaceRoot });

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
  }

  return emptyTasks;
}
