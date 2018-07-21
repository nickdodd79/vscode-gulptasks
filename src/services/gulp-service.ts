import { workspace } from 'vscode';
import { join } from 'path';
import { File } from '../models/file';
import { Task } from '../models/task';
import { ProcessService } from './process-service';

export class GulpService {

  constructor(private readonly root: string, public readonly context: string[], private readonly processes: ProcessService) { }

  createTask(name: string, file: File, logger: (output: string) => void): Task {
    return new Task(callback => {

      // Create a process instance
      const proc = this.processes.createProcess(this.root, [name, `--cwd "${this.root}" --gulpfile "${file.absolutePath}"`], data => {

        // Convert the data to a set of lines
        const value = data.toString();
        const lines = GulpService.sanitizeResult(value);

        if (logger) {

          // Feed each line to the logger function
          for (const line of lines) {
            logger(line);
          }
        }
      });

      // Then execute and handle the result
      callback = callback || (() => {});

      proc
        .execute()
        .then(() => callback())
        .catch(err => callback(err));

      // Return the terminate function for later termination
      return proc.terminate;
    });
  }

  getFileTasks(file: File): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {

      // Load and return the tasks for the provided file
      this.processes
        .createProcess(this.root, ['--tasks-simple', `--cwd "${this.root}" --gulpfile "${file.absolutePath}"`])
        .execute()
        .then(result => {
          const tasks = GulpService.sanitizeResult(result);
          resolve(tasks);
        })
        .catch(err => reject(err));
    });
  }

  static resolveInstall(processes: ProcessService): Promise<GulpService> {
    return new Promise<GulpService>((resolve, reject) => {

      // First attempt to resolve a global installation
      processes
        .createProcess(workspace.rootPath, ['--version'])
        .execute()
        .then(result => this.processResult('Global', result, workspace.rootPath, processes, resolve))
        .catch(() => {

          // Then check if a local install is available (i.e. in node_modules)
          const local = join(workspace.rootPath, 'node_modules/.bin');

          processes
            .createProcess(local, ['--version'])
            .execute()
            .then(result => this.processResult('Local', result, local, processes, resolve))
            .catch(err => reject(err));
        });
    });
  }

  private static processResult(scope: string, result: string, root: string, processes: ProcessService, resolve: (gulp: GulpService) => void): void {
    const versions = this.sanitizeResult(result);
    const gulp = new GulpService(root, [`Scope: ${scope}`, ...versions], processes);

    resolve(gulp);
  }

  private static sanitizeResult(lines: string): string[] {
    return lines
      .split(/\r{0,1}\n/)
      .map(line => {
        if (line.substr(0, 1) === '[') {
          const end = line.indexOf(']');

          if (end > -1) {
            line = line.substr(end + 1);
          }
        }

        return line.replace(/^\s+|\s+$/g, '');
      })
      .filter(line => line !== '');
  }
}
