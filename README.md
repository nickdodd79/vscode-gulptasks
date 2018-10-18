# Gulp Tasks

Allows you to visualize and execute gulp tasks found in your workspaces.

> **NOTE:** If you are using a multi-root workspace and have a custom filters array in your settings,
> you may need to add a glob prefix (**) to ```node_modules``` and ```bower_components``` to avoid errors. 
> This was fixed in v1.1.3 and the below example shows the required values.

### Preview
![Gulp Tasks Preview](https://raw.githubusercontent.com/nickdodd79/vscode-gulptasks/master/resources/gulptasks-preview.png)

### Settings
The following settings can be used to control the extension via **File** > **Preferences** > **Settings**:

* `gulptasks.pattern` A glob pattern for gulp file matching. Has a default value of `**/gulpfile*.js`.
* `gulptasks.filters` An array of globs used to include and exclude workspace paths. Has default values of `!**/node_modules/**` and `!**/bower_components/**`.
* `gulptasks.args` An array of args to be included when executing gulp commands. Has a default value of empty.
* `gulptasks.output.show` An enum value specifying when the output window should auto show. Has a default value of `Task Starts`. Options are `Task Starts`, `Task Progress`, `Task Completes`, `Task Errors` and `Never`.
* `gulptasks.notifications.executed` Whether to show notifications for successfully executed tasks. Has a default value of `true`.
* `gulptasks.notifications.terminated` Whether to show notifications for terminated tasks. Has a default value of `true`.
* `gulptasks.notifications.restarted` Whether to show notifications for restarted tasks. Has a default value of `true`.

Example:

```
{
  "gulptasks.pattern": "**/gulpfile*.js",
  "gulptasks.filters": [
    "!**/node_modules/**",
    "!**/bower_components/**"
  ],
  "gulptasks.args": [],
  "gulptasks.output.show": "Task Starts"
  "gulptasks.notifications.executed": true,
  "gulptasks.notifications.terminated": true,
  "gulptasks.notifications.restarted": true
}
```
