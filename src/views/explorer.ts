import { Event, EventEmitter, TreeItem, TreeDataProvider, ProviderResult, Disposable } from 'vscode';
import { workspace } from 'vscode';
import { EXTENSION_ID } from '../models/constants';
import { ExplorerNodeType} from '../models/constants';
import { ActionCommand, ContextCommand} from '../models/constants';
import { Settings } from '../models/settings';
import { Notifications } from '../models/notifications';
import { File } from '../models/file';
import { Logger } from '../logging/logger';
import { GulpService } from '../services/gulp-service';
import { FileService } from '../services/file-service';
import { CommandService } from '../services/command-service';
import { ExplorerNode } from './explorer-node';
import { RootNode } from './root-node';
import { FileNode } from './file-node';
import { TaskNode } from './task-node';

export class Explorer implements TreeDataProvider<ExplorerNode>, Disposable {

  private selected: TaskNode;

  private root = new RootNode();

  private _onDidChangeTreeData = new EventEmitter<ExplorerNode>();

  get onDidChangeTreeData(): Event<ExplorerNode> {
    return this._onDidChangeTreeData.event;
  }

  constructor(private readonly gulp: GulpService, private readonly files: FileService, private readonly commands: CommandService, private readonly logger: Logger) {

    // Register handlers for the commands
    this.commands.registerCommand(ActionCommand.Select, this.selectTask, this);
    this.commands.registerCommand(ActionCommand.Execute, this.executeTask, this);
    this.commands.registerCommand(ActionCommand.Terminate, this.terminateTask, this);
    this.commands.registerCommand(ActionCommand.Restart, this.restartTask, this);
    this.commands.registerCommand(ActionCommand.Refresh, this.load, this);
  }

  getTreeItem(node: ExplorerNode): TreeItem {
    return node;
  }

  getChildren(node?: ExplorerNode): ProviderResult<ExplorerNode[]> {
    if (!node) {
      return this.root.empty ? [this.root] : this.root.children();
    }

    return node.children();
  }

  async load(): Promise<void> {
    this.logger.output.log('Loading gulp tasks...');

    try {

      // Dispose before rebuilding to ensure node resources are released
      this.dispose();

      // Build the tree
      this.root = await this.loadFiles();
      this.update(this.selected);

      if (this.root.empty) {
        this.logger.output.log('> No gulp files found');
      } else {
        this.logger.output.log(`Let's get gulping...`);
      }
    }
    catch (ex) {
      this.logger.error(ex.message || ex);
    }
  }

  dispose(): void {

    // Clear the selection
    this.selected = undefined;

    // Dispose of the tree from the root down and reset
    if (this.root) {
      this.root.dispose();
      this.root = new RootNode();
    }
  }

  private async loadFiles(): Promise<RootNode> {
    const nodes = [];
    const files = await this.files.discoverGulpFiles();

    // Load the tasks for each discovered file
    for (const file of files) {
      const id = file.relativePath.replace(/\\/g, '-');
      const tasks = await this.loadTasks(id, file);
      const node = new FileNode(id, file, tasks);
      const taskNames = tasks.map(task => task.name);

      this.logger.output.log(`> ${file.relativePath} [${taskNames}]`);

      nodes.push(node);
    }

    return new RootNode(nodes);
  }

  private async loadTasks(fileId: string, file: File): Promise<TaskNode[]> {
    const nodes = [];
    const tasks = await this.gulp.getFileTasks(file);

    for (const task of tasks) {
      const id = `${fileId}:${task}`;
      const node = new TaskNode(id, task, file);

      nodes.push(node);
    }

    return nodes;
  }

  private selectTask(node: ExplorerNode): void {

    // Track the node if it is has a task type
    this.selected = node.type === ExplorerNodeType.Task
      ? node as TaskNode
      : undefined;

    this.update(this.selected);
  }

  private executeTask(): void {

    // Track the selected node at point of execution in case it changes during execution
    const node = this.selected;

    if (node) {

      // Create a task process and handle any output
      // Also update the tree to switch icons and state
      node.task = this.gulp.createTask(node.name, node.file, output => {
        this.logger.output.log(`> ${node.name}: ${output}`);
      });

      this.update(node);

      // Then execute the task and reset the tree upon completion
      node.task
        .execute()
        .then(() => {
          node.task = undefined;

          this.update(node);

          this.logger.output.log(`> ${node.name}: COMPLETED`);

          if (this.showNotification(notifications => notifications.executed)) {
            this.logger.alert.info(`The task '${node.name}' has completed successfully.`);
          }
        })
        .catch(() => {
          node.task = undefined;

          this.update(node);

          this.logger.output.log(`> ${node.name}: FAILED`);
          this.logger.alert.error(`The task '${node.name}' has failed.`);
        });
    }
  }

  private terminateTask(): void {

    // Track the selected node at point of execution in case it changes during execution
    const node = this.selected;

    if (node) {

      // Kill the task process and update the tree
      node.task
        .terminate()
        .then(() => {
          node.task = undefined;

          this.update(node);

          this.logger.output.log(`> ${node.name}: TERMINATED`);

          if (this.showNotification(notifications => notifications.terminated)) {
            this.logger.alert.info(`The task '${node.name}' has been terminated.`);
          }
        });
    }
  }

  private restartTask(): void {

    // Track the selected node at point of execution in case it changes during execution
    const node = this.selected;

    if (node) {

      // Terminate the task and when completed execute again
      this.logger.output.log(`> ${node.name}: RESTARTING`);

      node.task
        .terminate()
        .then(() => {
          this.executeTask();

          if (this.showNotification(notifications => notifications.restarted)) {
            this.logger.alert.info(`The task '${node.name}' has been restarted.`);
          }
        });
    }
  }

  private showNotification(callback: (notifications: Notifications) => boolean): boolean {
    const config = workspace.getConfiguration();
    const settings = config.get<Settings>(EXTENSION_ID);

    return callback(settings.notifications);
  }

  private update(node: TaskNode): void {

    // Need to resolve the selected task and hide/show the action icons
    let canExecute = false;
    let canTerminate = false;
    let canRestart = false;

    if (node) {
      canExecute = !node.task;
      canTerminate = !!node.task;
      canRestart = !!node.task;
    }

    this.commands.setContext(ContextCommand.CanExecute, canExecute);
    this.commands.setContext(ContextCommand.CanTerminate, canTerminate);
    this.commands.setContext(ContextCommand.CanRestart, canRestart);

    this._onDidChangeTreeData.fire();
  }
}
