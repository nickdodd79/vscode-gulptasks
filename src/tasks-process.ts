'use strict';

import { Terminal, window, workspace } from 'vscode';

import * as cp from 'child_process';
import * as utils from './utils';

export interface TaskContext {
  gulp: string;
  task: string;
  workingDirectory: string;
}

let _terminal: Terminal = undefined;
const _cache: { [id: string]: cp.ChildProcess } = {};

async function executeProcess(context: TaskContext): Promise<void> {
  let command = `${context.gulp} ${context.task}`;

  // If enable run the command in a terminal
  const config = utils.config();

  if (config.runInTerminal && typeof window.createTerminal === 'function') {

    // Convert the gulp path to relative
    let count = 0;

    if (context.workingDirectory !== workspace.rootPath) {
      const workingDirectory = context.workingDirectory.substr(workspace.rootPath.length + 1);
      const segments = workingDirectory.split('\\');

      count = segments.length;
    }

    command = command.substr(workspace.rootPath.length + 1);

    for (var index = 0; index < count; index++) {
      command = `..\\${command}`;
    }

    // Run the task in a terminal
    if (!_terminal) {
      _terminal = window.createTerminal('Gulp Tasks');
    }

    _terminal.show(true);

    _terminal.sendText(`cd ${context.workingDirectory}`);
    _terminal.sendText(command);

    utils.showInfo(`The execution of '${context.task}' completed successfully.`, `Executed '${context.task}'.`);

  } else {

    // Ensure any existing terminals are disposed
    if (_terminal) {
      _terminal.dispose();
      _terminal = undefined;
    }

    // Run the command and use the output
    const process = cp.exec(command, { cwd: context.workingDirectory }, (error, stdout, stderr) => {
      if (stderr) {
        utils.showError(stderr);
      } else {

        // Output the gulp process messages
        const lines = stdout.split(/\r{0,1}\n/);

        for (const line of lines) {
          if (line.length > 0) {
            utils.outputLog(line);
          }
        }

        utils.showInfo(`The execution of '${context.task}' completed successfully.`, `Executed '${context.task}'.`);

        // Clear the cached process - it has completed and so cannot be terminated
        _cache[context.task] = undefined;
      }
    });

    // Cache the process for termination
    _cache[context.task] = process;
  }
}

function terminateProcess(context: TaskContext, callback: () => void): void {
  const process = _cache[context.task];

  if (process) {

    // Subscribe to the exit event to ensure the process has been terminated
    // Then provide a message indicating it has been terminated
    process.on('exit', callback);
    process.kill();

    // Clear the cache to avoid multiple terminatation requests
    _cache[context.task] = undefined;
  }
}

export async function execute(context: TaskContext): Promise<void> {
  if (context && !_cache[context.task]) {
    utils.outputInfo(`Executing '${context.task}' ...`);
    await executeProcess(context);
  }
}

export function terminate(context: TaskContext): void {
  if (context) {
    terminateProcess(context, () => utils.showInfo(`The termination of '${context.task}' completed successfully.`, `Terminated '${context.task}'.`));
  }
}

export async function restart(context: TaskContext): Promise<void> {
  if (context) {
    if (!_cache[context.task]) {
      await execute(context);

    } else {
      utils.outputInfo(`Restarting '${context.task}' ...`);

      terminateProcess(context, async () => {
        await executeProcess(context);
      });
    }
  }
}
