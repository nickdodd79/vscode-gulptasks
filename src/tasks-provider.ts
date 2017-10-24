'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import * as loader from './tasks-loader';

class TaskItem extends vscode.TreeItem {

  contextValue = 'gulptask';

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'gulp.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'gulp.svg')
  };

  constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
    super(label, collapsibleState);
  }
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

        // Load the tasks and create a tree item for each
        // Register the gulptasks.select command to track the selected task and it command line call
        loader.tasks().then(result => {
          const items = result.tasks.map(task => new TaskItem(task, vscode.TreeItemCollapsibleState.None, {
            title: '',
            command: `gulptasks.select`,
            arguments: [
              {
                command: `gulp ${task}`,
                workingDirectory: result.workingDirectory
              }
            ]
          }));

          resolve(items);
        });
      } else {
        resolve([]);
      }
    });
  }
}
