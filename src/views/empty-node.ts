import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { ExplorerNode } from './explorer-node';

export class EmptyNode extends ExplorerNode {

  constructor(id: string, message: string) {
    super(`${id}::empty`, ExplorerNodeType.Empty, message, TreeItemCollapsibleState.None);
  }

  children(): ExplorerNode[] {
    return [];
  }

  dispose(): void { }
}
