import { Disposable } from 'vscode';
import { window, workspace } from 'vscode';
import { EXTENSION_ID, EXTENSION_NAME } from '../models/constants';
import { Settings } from '../models/settings';
import { OutputShow } from '../models/output-show';
import { OutputSource } from '../models/output-source';

export class OutputLogger implements Disposable {

  private resolvers: { [id: string]: (source: OutputSource) => boolean } = {
    [OutputShow.TaskProgress]: () => true,
    [OutputShow.TaskStarts]: source => source === OutputSource.Start,
    [OutputShow.TaskCompletes]: source => source === OutputSource.Complete || source === OutputSource.Error,
    [OutputShow.TaskErrors]: source => source === OutputSource.Error,
    [OutputShow.Never]: () => false
  };

  private channel = window.createOutputChannel(EXTENSION_NAME);

  log(message: string, source?: OutputSource): void {
    if (message) {
      this.channel.appendLine(message);

      // Determine if the output window should be shown
      if (source) {
        const config = workspace.getConfiguration();
        const settings = config.get<Settings>(EXTENSION_ID);
        const resolver = this.resolvers[settings.output.show];

        if (resolver && resolver(source)) {
          this.channel.show(true);
        }
      }
    }
  }

  dispose(): void {
    this.channel.dispose();
  }
}
