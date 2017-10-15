'use strict';

import * as vscode from 'vscode';
import * as executer from './tasks-executer';

import { TasksProvider } from './tasks-provider';

let _task: string;

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any): void {
  const registration = vscode.commands.registerCommand(command, callback);
  context.subscriptions.push(registration);
}

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.rootPath;
  const tasksProvider = new TasksProvider(workspaceRoot);
  const registration = vscode.window.registerTreeDataProvider('gulptasks', tasksProvider);

  registerCommand(context, 'gulptasks.select', task => _task = task);
  registerCommand(context, 'gulptasks.execute', () => executer.executeTask(_task, workspaceRoot));
  registerCommand(context, 'gulptasks.refresh', () => tasksProvider.refresh());

  context.subscriptions.push(registration);
}
