'use strict';

import * as path from 'path';
import * as filehound from 'filehound';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as utils from './utils';

export interface TasksResult {
  readonly tasks: string[];
  readonly workingDirectory: string | undefined;
}

function find(workspaceRoot: string): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve, reject) => {
    const paths = [];
    const finder = filehound.create()
      .paths(workspaceRoot)
      .match('gulpfile.js');

    // Need to ignore any gulpfile.js instances in node_modules
    // Are there more to ignore??
    finder.on('match', file => {
      if (file.indexOf('node_modules') === -1) {
        paths.push(file);
      }
    });

    finder.on('end', file => {
      if (paths.length > 0) {
        resolve(paths[0]);
      } else {
        resolve();
      }
    });

    finder.find();
  });
}

function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      }

      resolve({ stdout, stderr });
    });
  });
}

export async function tasks(): Promise<TasksResult> {
  const workspaceRoot = vscode.workspace.rootPath;
  const emptyResult: TasksResult = {
    tasks: [],
    workingDirectory: undefined
  };

  // Verify the workspace root
  if (!workspaceRoot) {
    return emptyResult;
  }

  utils.outputInfo(`Discovering gulp file ...`);

  // Verify a gulp file exists
  const file = await find(workspaceRoot);

  if (!file) {
    utils.outputInfo('No gulp file found in the current workspace.');
    return emptyResult;
  }

  utils.outputInfo(`Discovered: ${file}`);

  // Check gulp can be run
  const workingDirectory = path.dirname(file);

  try {
    await exec('gulp -v', { cwd: workingDirectory });
  } catch (err) {
    utils.showError('Unable to find an install of gulp. Try running \'npm i -g gulp\'.');
    return emptyResult;
  }

  // Run the loader command to get a list of the gulp tasks
  utils.outputInfo('Loading gulp tasks ...');

  try {
    const output = await exec('gulp --tasks-simple', { cwd: workingDirectory });

    if (output.stderr) {
      utils.showError(output.stderr);
    } else {
      const tasks: string[] = [];

      if (output.stdout) {

        // The tasks are returned on separate lines from the output
        const lines = output.stdout.split(/\r{0,1}\n/);

        for (const line of lines) {
          if (line.length > 0) {
            tasks.push(line);
          }
        }
      }

      utils.outputInfo(`Loaded ${tasks.length} gulp tasks.`);

      return { tasks, workingDirectory };
    }
  } catch (err) {
    if (err.stderr) {
      utils.showError(err.stderr);
    }
  }

  return emptyResult;
}
