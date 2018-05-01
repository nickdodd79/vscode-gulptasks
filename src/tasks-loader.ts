'use strict';

import * as fs from 'fs';
import * as io from 'path';
import * as filehound from 'filehound';
import * as minimatch from 'minimatch';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as utils from './utils';

interface Config {
  file: string;
  discovery: {
    dir: string;
    dirExclusions: string[];
  }
}

interface DiscoveryContext {
  absolute: string;
  relative: string;
}

export interface TasksResult {
  readonly tasks: string[];
  readonly workingDirectory: string | undefined;
}

function sanitizePath(path: string): string {
  path = path.replace(/\\/g, '/');
  path = path.replace(/\/\//g, '/');

  if (path.substr(0, 1) === '/') {
    path = path.substr(1);
  }

  return path.toLowerCase();
}

function resolvePath(contexts: DiscoveryContext[], exclusions: string[]): string | undefined {
  if (contexts.length > 0) {

    // Match each exclude to the path list and build a list of excluded paths
    const excludes: string[] = [];

    exclusions.forEach(exclude => {

      // Check which paths match the current context
      const pattern = sanitizePath(`${exclude}/gulpfile*.js`);
      const relatives = contexts.map(context => context.relative);
      const matches = minimatch.match(relatives, pattern, {
        nocase: true
      });

      matches.forEach(match => excludes.push(match));
    });

    // Then filter the paths to trunacate the excluded paths
    // If any remain then the first is the list is selected
    const paths = contexts
      .filter(context => excludes.indexOf(context.relative) === -1)
      .map(context => context.absolute);

    if (paths.length > 0) {
      return paths[0];
    }
  }

  return undefined;
}

function pathExists(path: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    if (!path) {
      resolve(false);
    } else {
      fs.exists(path, result => resolve(result));
    }
  });
}

function findRoot(root: string): Promise<string | undefined> {
  return new Promise<string | undefined>(resolve => {
    const files = filehound.create()
      .path(root)
      .addFilter(filterFiles)
      .depth(0)
      .findSync();

    resolve(files.length > 0 ? files[0] : undefined);
  });
}

function filterFiles(file: any): any {
  return fileMatches(file._pathname, '**/gulpfile*.js');
}

function fileMatches(file: string, pattern: string): boolean {
  return minimatch(file, pattern, {
    nocase: true
  });
}

async function find(root: string, config: Config): Promise<string | undefined> {

  // First check the workspace root
  if (config.discovery.dirExclusions.indexOf('*') === -1) {
    const file = await findRoot(root);

    if (file) {
      return Promise.resolve(file);
    }
  }

  // Otherwise traverse the sub folders to discover any others
  const exclusions = config.discovery.dirExclusions.filter(exclusion => exclusion !== '*');

  return new Promise<string | undefined>((resolve, reject) => {
    const contexts: DiscoveryContext[] = [];
    const finder = filehound.create()
      .paths(root)
      .addFilter(filterFiles);

      finder.on('match', (file: string) => {
        let relative = file.substring(root.length);
        relative = sanitizePath(relative);

        // Exclude the root gulpfile - a discover was attempted beforehand
        if (!fileMatches(relative, 'gulpfile*.js')) {
          contexts.push({
            absolute: file,
            relative: relative
          });
        }
      });

      finder.on('end', file => {
        const path = resolvePath(contexts, exclusions);

        if (path) {
          resolve(path);
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
        reject({ stdout, stderr });
      }

      resolve({ stdout, stderr });
    });
  });
}

export async function tasks(): Promise<TasksResult> {
  const workspaceRoot = vscode.workspace.rootPath;
  const config = vscode.workspace.getConfiguration().get<Config>('gulptasks');
  const emptyResult: TasksResult = {
    tasks: [],
    workingDirectory: undefined
  };

  // Verify the workspace root
  if (!workspaceRoot) {
    return emptyResult;
  }

  // Check if a specific file is configured
  let file: string = null;

  if (config.file !== "") {
    file = config.file;

    if (!io.isAbsolute(config.file)) {
      file = io.join(workspaceRoot, file);
    }

    if (!await pathExists(file)) {
      file = null;
    }
  }

  // Resolve the discovery directory
  if (!file) {
    let root = workspaceRoot;
    let dir = config.discovery.dir;

    if (dir && !io.isAbsolute(dir)) {
      dir = io.join(workspaceRoot, dir);
    }

    if (await pathExists(dir)) {
      root = dir;
    }

    utils.outputInfo(`Discovering gulp file ...`);

    // Verify a gulp file exists
    file = await find(root, config);
  }

  if (!file) {
    utils.outputInfo('No gulp file found in the current workspace.');
    return emptyResult;
  }

  utils.outputInfo(`Discovered: ${file}`);

  // Check gulp can be run
  const workingDirectory = io.dirname(file);
  const fileName = io.basename(file);

  if (fileName === 'gulp.js') {
    utils.outputWarning('Naming your gulp file \'gulp.js\' can result in errors.');
  }

  try {
    await exec('gulp --version --gulpfile "' + fileName + '"', { cwd: workingDirectory });
  } catch (err) {
    utils.showError('Unable to find an install of gulp. Try running \'npm i -g gulp\'.');
    return emptyResult;
  }

  // Run the loader command to get a list of the gulp tasks
  utils.outputInfo('Loading gulp tasks ...');

  try {
    const output = await exec('gulp --tasks-simple --gulpfile "' + fileName + '"', { cwd: workingDirectory });

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
    } else {
      utils.showError('Failed to load gulp tasks. This could be because you need to locally install gulp by running \'npm i gulp\'.');
    }
  }

  return emptyResult;
}
