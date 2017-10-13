'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import { exec, exists, output } from './utils';

export async function tasks(): Promise<string[]> {
  const emptyTasks: string[] = [];
  const commandLine = 'gulp --tasks-simple';
  const workspaceRoot = vscode.workspace.rootPath;

  if (!workspaceRoot) {
    return emptyTasks;
  }

  const file = path.join(workspaceRoot, 'gulpfile.js');

  if (!await exists(file)) {
    output('No gulp file found.');
    return emptyTasks;
  }

  output('Loading gulp tasks ...');

  try {
    const { stdout, stderr } = await exec(commandLine, { cwd: workspaceRoot });

    if (stderr && stderr.length > 0) {
      output(stderr);
    } else {
      const tasks: string[] = [];

      if (stdout) {
        const lines = stdout.split(/\r{0,1}\n/);

        for (const line of lines) {
          if (line.length > 0) {
            tasks.push(line);
          }
        }
      }

      output('Loading gulp tasks completed.');

      return tasks;
    }
  } catch (err) {
    if (err.stderr) {
      output(err.stderr);
    }

    if (err.stdout) {
      output(err.stdout);
    }
  }

  output('Loading gulp tasks failed.');

  return emptyTasks;
}
