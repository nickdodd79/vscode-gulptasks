import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { File } from '../models/file';
import { ExplorerNode } from './explorer-node';
import { EmptyNode } from './empty-node';
import { TaskNode } from './task-node';

export class FileNode extends ExplorerNode {

  private tasks: TaskNode[];

  get empty(): boolean {
    return this.tasks.length === 0;
  }

  constructor(id: string, public readonly file: File, tasks: TaskNode[]) {
    super(id, ExplorerNodeType.File, file.relativePath, TreeItemCollapsibleState.Expanded);

    this.tasks = tasks || [];

    // Assign the gulp icon
    this.iconPath = this.icon('gulp');
  }

  children(): ExplorerNode[] {

    // Return either the tasks or an empty message node
    if (this.empty) {
      const child = new EmptyNode(this.id, 'No gulp tasks');
      return [child];
    }

    return this.tasks;
  }

  dispose(): void {
    for (const task of this.tasks) {
      task.dispose();
    }
  }
}
