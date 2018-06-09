import { TreeItem, TreeItemCollapsibleState, Disposable } from 'vscode';
import { join } from 'path';
import { EXTENSION_ID } from '../models/constants';
import { ExplorerNodeType } from '../models/constants';
import { ActionCommand } from '../models/constants';

interface IconTheme {
  dark: string;
  light: string;
}

export abstract class ExplorerNode extends TreeItem implements Disposable {

  constructor(public readonly id: string, public readonly type: ExplorerNodeType, label: string, collapsibleState: TreeItemCollapsibleState) {
    super(label, collapsibleState);

    // Bind common setup for all explorer nodes
    this.contextValue = `${EXTENSION_ID}:${this.type}`;
    this.command = {
      title: label,
      command: ActionCommand.Select,
      arguments: [this]
    };
  }

  abstract children(): ExplorerNode[];
  abstract dispose(): void;

  protected icon(name: string): string {
    return join(__filename, '..', '..', '..', 'resources', 'icons', `${name}.svg`);
  }

  protected iconTheme(name: string): IconTheme {
    return {
      dark: this.icon(`${name}-dark`),
      light: this.icon(`${name}-light`)
    };
  }
}
