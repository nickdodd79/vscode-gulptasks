'use strict';

import * as vscode from 'vscode';

let _channel: vscode.OutputChannel;

function sanitize(value: string): string {
  const lines = value.split(/\r{0,1}\n/);
  return lines.join('');
}

function output(message: string, type?: string): void {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Gulp Tasks');
  }

  if (type) {
    _channel.appendLine(`[${type}] ${message}`);
  } else {
    _channel.appendLine(message);
  }

  _channel.show(true);
}

export function outputLog(message: string): void {
  output('> ' + message);
}

export function outputInfo(message: string): void {
  output(message, 'Info');
}

export function outputWarning(message: string): void {
  output(message, 'Warning');
}

export function outputError(message: string): void {
  output(message, 'Error');
}

export function showInfo(message: string, output?: string): void {
  message = sanitize(message);

  vscode.window.showInformationMessage(`Gulp Tasks: ${message}`);
  outputInfo(output || message);
}

export function showError(message: string, output?: string): void {
  message = sanitize(message);

  vscode.window.showErrorMessage(`Gulp Tasks: ${message}`);
  outputError(output || message);
}
