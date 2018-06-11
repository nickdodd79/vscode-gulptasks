export const EXTENSION_ID = 'gulptasks';
export const EXPLORER_ID = 'gulptasks:explorer';

export const EXTENSION_NAME = 'Gulp Tasks';

export enum ExplorerNodeType {
  Empty = 'empty',
  Root = 'root',
  File = 'file',
  Task = 'task'
}

export enum ContextCommand {
  Enabled = 'gulptasks:enabled',
  CanExecute = 'gulptasks:canExecute',
  CanTerminate = 'gulptasks:canTerminate',
  CanRestart = 'gulptasks:canRestart'
}

export enum ActionCommand {
  Select = 'gulptasks:select',
  Execute = 'gulptasks:execute',
  Terminate = 'gulptasks:terminate',
  Restart = 'gulptasks:restart',
  Refresh = 'gulptasks:refresh'
}
