'use strict';

import * as vscode from 'vscode';

import { TasksProvider } from './tasksprovider';
import { exec, output } from './utils';

let _task: string;

async function executeTask(workspaceRoot: string | undefined) {
  if (workspaceRoot && _task) {
    output(`Executing '${_task}' ...`);

    try {
      const { stderr } = await exec(_task, { cwd: workspaceRoot });

      if (stderr && stderr.length > 0) {
        output(stderr);
      } else {
        output(`Executing '${_task}' completed.`);
        return;
      }
    } catch (err) {
      if (err.stderr) {
        output(err.stderr);
      }

      if (err.stdout) {
        output(err.stdout);
      }
    }

    output(`Executing '${_task}' failed.`);
  }
}

export function activate(_context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.rootPath;
  const tasksProvider = new TasksProvider(workspaceRoot);

  vscode.window.registerTreeDataProvider('gulptasks', tasksProvider);

  vscode.commands.registerCommand('gulptasks.select', task => _task = task);
  vscode.commands.registerCommand('gulptasks.execute', () => executeTask(workspaceRoot));
  vscode.commands.registerCommand('gulptasks.refresh', () => tasksProvider.refresh());
}
