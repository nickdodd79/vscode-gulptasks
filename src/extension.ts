'use strict';

import * as vscode from 'vscode';
import * as process from './tasks-process';

import { TasksProvider } from './tasks-provider';

let _task: process.TaskContext | undefined;

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any): void {
  const registration = vscode.commands.registerCommand(command, callback);
  context.subscriptions.push(registration);
}

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.rootPath;
  const provider = new TasksProvider(workspaceRoot);
  const registration = vscode.window.registerTreeDataProvider('gulptasks', provider);

  registerCommand(context, 'gulptasks.select', task => _task = task);
  registerCommand(context, 'gulptasks.execute', () => process.execute(_task));
  registerCommand(context, 'gulptasks.terminate', () => process.terminate(_task));

  registerCommand(context, 'gulptasks.refresh', () => {
    provider.refresh();

    // Clear the selected task - prevent execution without an tree item being selected
    _task = undefined;
  });

  context.subscriptions.push(registration);
}
