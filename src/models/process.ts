export class Process {

  constructor(
    public readonly execute: () => Promise<string>,
    public readonly terminate: () => Promise<void>) {  }
}
