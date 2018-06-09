import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { File } from '../models/file';
import { ExplorerNode } from './explorer-node';
import { TaskNode } from './task-node';

export class FileNode extends ExplorerNode {

  private tasks: TaskNode[];

  constructor(id: string, public readonly file: File, tasks: TaskNode[]) {
    super(id, ExplorerNodeType.File, file.relativePath, TreeItemCollapsibleState.Expanded);

    this.tasks = tasks || [];

    // Assign the gulp icon
    this.iconPath = this.icon('gulp');
  }

  children(): ExplorerNode[] {
    return this.tasks;
  }

  dispose(): void {
    for (const task of this.tasks) {
      task.dispose();
    }
  }
}
