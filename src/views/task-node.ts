import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { File } from '../models/file';
import { Task } from '../models/task';
import { ExplorerNode } from './explorer-node';

export class TaskNode extends ExplorerNode {

  private _task: Task;

  get task(): Task {
    return this._task;
  }
  set task(value: Task) {
    this._task = value;
    this.update();
  }

  constructor(id: string, public readonly name: string, public readonly file: File) {
    super(id, ExplorerNodeType.Task, name, TreeItemCollapsibleState.None);

    // Initialize the icon
    this.update();
  }

  children(): ExplorerNode[] {
    return [];
  }

  dispose(): void {
    if (this.task) {
      this.task.dispose();
    }
  }

  private update(): void {
    this.iconPath = this.iconTheme(this.task ? 'execute' : 'idle')
  }
}
