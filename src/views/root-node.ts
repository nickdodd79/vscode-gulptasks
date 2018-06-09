import { TreeItemCollapsibleState } from 'vscode';
import { ExplorerNodeType } from '../models/constants';
import { ExplorerNode } from './explorer-node';
import { FileNode } from './file-node';

export class RootNode extends ExplorerNode {

  private files: FileNode[];

  get empty(): boolean {
    return this.files.length === 0;
  }

  constructor(files?: FileNode[]) {
    super('root', ExplorerNodeType.Root, 'Files', TreeItemCollapsibleState.Expanded);

    this.files = files || [];

    // Apply a different title if there are no files
    if (this.empty) {
      this.label = 'No gulp files found';
      this.collapsibleState = TreeItemCollapsibleState.None;
    }
  }

  children(): ExplorerNode[] {
    return this.files.sort((file1, file2) => {

      // Ensure the files are displayed alphabetically with root items at the top
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
