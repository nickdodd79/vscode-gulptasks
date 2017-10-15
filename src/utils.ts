'use strict';

import * as vscode from 'vscode';

let _channel: vscode.OutputChannel;

function sanitize(value: string): string {
  const lines = value.split(/\r{0,1}\n/);
  return lines.join('');
}

function output(type: string, value: string): void {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Gulp Tasks');
  }

  _channel.appendLine(`[Gulp Tasks - ${type}] ${value}`);
  _channel.show(true);
}

export function outputInfo(message: string): void {
  output('Info', message);
}

export function outputError(message: string): void {
  output('Error', message);
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
