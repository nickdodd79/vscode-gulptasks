'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import * as loader from './tasksloader';

class TaskItem extends vscode.TreeItem {
  constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
    super(label, collapsibleState);
  }

  contextValue = 'gulptask';
  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'gulp.svg'),
    dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'gulp.svg')
  };
}

export class TasksProvider implements vscode.TreeDataProvider<TaskItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined> = new vscode.EventEmitter<TaskItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskItem): Thenable<TaskItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No tasks in empty workspace');
      return Promise.resolve([]);
    }

    return new Promise(resolve => {
      if (!element) {
        loader.tasks().then(tasks => {
          const items = tasks.map(task => new TaskItem(task, vscode.TreeItemCollapsibleState.None, {
            title: '',
            command: `gulptasks.select`,
            arguments: [`gulp ${task}`]
          }));

          resolve(items);
        });
      } else {
        resolve([]);
      }
    });
  }
}
