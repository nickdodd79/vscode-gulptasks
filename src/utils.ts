'use strict';

import * as fs from 'fs';
import * as cp from 'child_process';
import * as vscode from 'vscode';

let _channel: vscode.OutputChannel;

export function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    fs.exists(file, value => {
      resolve(value);
    });
  });
}

export function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      }
      resolve({ stdout, stderr });
    });
  });
}

export function output(value: string): void {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Gulp Auto Detection');
  }

  _channel.appendLine(value);
  _channel.show(true);
}
