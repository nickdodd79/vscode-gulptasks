import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { ExplorerNode } from './explorer-node';
import { EmptyNode } from './empty-node';
import { FileNode } from './file-node';

export class RootNode extends ExplorerNode {

  private files: FileNode[];

  get empty(): boolean {
    return this.files.length === 0;
  }

  constructor(files?: FileNode[]) {
    super('root', ExplorerNodeType.Root, 'Files', TreeItemCollapsibleState.Expanded);

    this.files = files || [];
  }

  children(): ExplorerNode[] {

    // If there are no files, show a relevant message
    if (this.empty) {
      const child = new EmptyNode(this.id, 'No gulp files found');
      return [child];
    }

    // Otherwise ensure the files are displayed alphabetically with root items at the top
    return this.files.sort((file1, file2) => {
      const split = file1.file.relativePath.split('\\');

      if (split.length === 1 || file1.file.relativePath < file2.file.relativePath) {
        return -1;
      }

      return file1.file.relativePath > file2.file.relativePath ? 1 : 0;
    });
  }

  dispose(): void {
    for (const file of this.files) {
      file.dispose();
    }
  }
}
