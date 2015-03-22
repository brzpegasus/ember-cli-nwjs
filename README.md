# ember-cli-node-webkit

[![npm version](https://badge.fury.io/js/ember-cli-node-webkit.svg)](http://badge.fury.io/js/ember-cli-node-webkit)
[![Dependency Status](https://david-dm.org/brzpegasus/ember-cli-node-webkit.svg)](https://david-dm.org/brzpegasus/ember-cli-node-webkit)
[![Build Status](https://travis-ci.org/brzpegasus/ember-cli-node-webkit.svg)](https://travis-ci.org/brzpegasus/ember-cli-node-webkit)

An [ember-cli](http://www.ember-cli.com/) addon for developing Ember.js applications with [NW.js](http://nwjs.io/) (formerly node-webkit).

* Get started quickly with an application blueprint configured for NW.js.
* Build, watch, and run the app in NW.js with a convenient command: `ember nw`.
* Build and package your app for production in one step with the `ember nw:package` command.

**Sample apps built with this addon:**

* [Markdown Editor](https://github.com/brzpegasus/ember-nw-markdown)

## Installation

From the root of your Ember CLI project:

```
ember install:addon ember-cli-node-webkit
```

This will do the following:

* Install the addon NPM package (`npm install --save-dev ember-cli-node-webkit`)
* Run the addon blueprint (`ember generate node-webkit`)
  * Add the blueprint [files](https://github.com/brzpegasus/ember-cli-node-webkit/tree/master/blueprints/node-webkit/files) to your project
  * Install the [`nw`](https://www.npmjs.com/package/nw) NPM package locally

## Build, Watch, and Run NW.js

### Command

You can execute `ember build --watch` then start up NW.js with a single command:

```
ember nw
```

As the app gets rebuilt during development, the NW.js window will automatically reload the current page, so you can see the changes that you made without having to stop and restart the entire process.

### Options

The following command line options let you specify a target environment or change the directory where the built assets are stored.

**`--environment`** _(String)_ (Default: 'development')
 * Target environment for the Ember app build
 * Alias: `-e <value>, -dev (--environment=development), -prod (--environment=production)`

**`--output-path`** _(String)_ (Default: 'dist/')
 * Output directory for the Ember app build
 * Aliases: `-o <value>`

### NW.js Binary

This addon is configured to install NW.js from [NPM](https://www.npmjs.com/package/nw) and add it to your project as a local dependency.

To use a different NW.js:

* Remove the `nw` dependency from your project (`npm uninstall --save-dev nw`)
* Set an environment variable named `NW_PATH` that points to the desired binary. For instance, you may have downloaded the executable from the [NW.js website](https://github.com/nwjs/nw.js#downloads) and wish to use that instead.
* On Windows, if the location of your `nw.exe` has been added to your `PATH`, then the `NW_PATH` environment variable does not need to be set.

## Packaging

### Command

```
ember nw:package
```

This command builds your Ember app, assembles all the assets necessary for NW.js, then generates the final executable using [`node-webkit-builder`](https://github.com/mllrsohn/node-webkit-builder).

### Options

You can pass the following command line options:

**`--environment`** _(String)_ (Default: 'production')
 * Target environment for the Ember app build
 * Alias: `-e <value>, -dev (--environment=development), -prod (--environment=production)`

**`--output-path`** _(String)_ (Default: 'dist/')
 * Output directory for the Ember app build
 * Aliases: `-o <value>`

**`--config-file`** _(String)_ (Default: 'config/nw-package.js')
 * Configuration file for `node-webkit-builder`
 * Aliases: `-f <value>`

### Configuring node-webkit-builder

`node-webkit-builder` itself comes with a lot of build [options](https://github.com/mllrsohn/node-webkit-builder#options). You can customize any of those settings by supplying a configuration file named `config/nw-package.js` in your project, or call `ember nw:package` with the `--config-file` option set to the desired file.

#### Configuration File

The configuration file must be a node module that exports a plain object with the names of the options you wish to override as keys:

```javascript
// config/nw-package.js

module.exports = {
  appName: 'my-nw-app',
  platforms: ['osx64', 'win64'],
  buildType: function() {
    return this.appVersion;
  }
};
```

#### Default Settings

`ember-cli-node-webkit` sets the following options by default:

* **files**
  * Value: `['package.json', 'dist/**', 'node_modules/<name>/**']`
  * `'node_modules/<name>/**'` is listed for every non-dev npm dependency declared in your project.
* **platforms**
  * Value: `[<current_platform>]`
* **buildDir**
  * Value: `build/app`
* **cacheDir**
  * Value: `build/cache`

## Contribution

### Working with `master`

To install the addon from `master`, run the following:

```
git clone git@github.com:brzpegasus/ember-cli-node-webkit.git 
cd ember-cli-node-webkit
npm link
```

Then, in your Ember CLI project:

* Add `ember-cli-node-webkit` to your `package.json`'s dev dependencies so that Ember CLI can discover and register the addon:

```json
{
  "devDependencies": {
    "ember-cli-node-webkit": "*"
  }
}
```

* Link to your local `ember-cli-node-webkit` and go through the addon install steps:

```
npm link ember-cli-node-webkit
ember g node-webkit
```

### Running Tests

To run the addon's test suite:

```
cd ember-cli-node-webkit
npm install
npm test
```

### Want to Help?

This addon was created to help Ember.js developers build applications in NW.js. If you find patterns that work well for you, or would like to suggest ideas to make this addon even better, feel free to open new issues or submit pull requests. I'd love to hear your feedback!

## License

[Licensed under the MIT license](http://opensource.org/licenses/mit-license.php)
