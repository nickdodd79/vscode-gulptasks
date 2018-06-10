# Gulp Tasks

Allows you to visualize and execute gulp tasks found in your workspaces.

### Preview
![Gulp Tasks Preview](https://raw.githubusercontent.com/nickdodd79/vscode-gulptasks/master/resources/gulptasks-preview.png)

### Settings
The following settings can be used to control the extension via **File** > **Preferences** > **Settings**:

* `gulptasks.pattern` A glob pattern for gulp file matching. Has a default value of `**/gulpfile*.js`.
* `gulptasks.filters` An array of globs used to include and exclude workspace paths. Has a default value of `!node_modules/**` and `!bower_components/**`.
* `gulptasks.notifications.executed` Whether to show notifications for successfully executed tasks. Has a default value of `true`.
* `gulptasks.notifications.terminated` Whether to show notifications for terminated tasks. Has a default value of `true`.
* `gulptasks.notifications.restarted` Whether to show notifications for restarted tasks. Has a default value of `true`.

Example:

```
{
  "gulptasks.pattern": "**/gulpfile*.js",
  "gulptasks.filters": [
    "!node_modules/**",
    "!bower_components/**"
  ],
  "gulptasks.notifications.executed": true,
  "gulptasks.notifications.terminated": true,
  "gulptasks.notifications.restarted": true
}
```
