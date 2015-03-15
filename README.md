# ember-cli-node-webkit

[![npm version](https://badge.fury.io/js/ember-cli-node-webkit.svg)](http://badge.fury.io/js/ember-cli-node-webkit)
[![Dependency Status](https://david-dm.org/brzpegasus/ember-cli-node-webkit.svg)](https://david-dm.org/brzpegasus/ember-cli-node-webkit)
[![Build Status](https://travis-ci.org/brzpegasus/ember-cli-node-webkit.svg)](https://travis-ci.org/brzpegasus/ember-cli-node-webkit)

An [ember-cli](http://www.ember-cli.com/) addon for developing Ember.js applications with [NW.js](http://nwjs.io/) (formerly node-webkit).

This addon updates your Ember app with the necessary configuration and scripts to make it run in a NW.js environment.
It also provides a convenient command (`ember nw`) to both build the app and launch it in a NW.js window.

## Installation

From the root of your Ember CLI project:

```
ember install:addon ember-cli-node-webkit
```

This will do the following:

* Install the addon NPM package (`npm install --save-dev ember-cli-node-webkit`)
* Run the addon blueprint (`ember generate node-webkit`)
  * Add the blueprint [files](https://github.com/brzpegasus/ember-cli-node-webkit/tree/master/blueprints/node-webkit/files) to your project
  * Install the [`nw`](https://www.npmjs.com/package/nw) NPM package

## Build, Watch, and Run NW.js

You can execute `ember build --watch` then start up NW.js with a single command:

```
ember nw
```

To specify a specific target environment (e.g. `development` or `production`):

```
ember nw --environment=<ENV_NAME>
```

As the app gets rebuilt during development, the NW.js window will automatically reload the current page, so you can see the changes that you made without having to stop and restart the entire process.

## NW.js Binary

This addon is configured to install NW.js from [NPM](https://www.npmjs.com/package/nw) and add it to your project as a local dependency.

To use a different NW.js:

* Remove the `nw` dependency from your project (`npm uninstall --save-dev nw`)
* Set an environment variable named `NW_PATH` that points to the desired binary. For instance, you may have downloaded the executable from the [NW.js website](https://github.com/nwjs/nw.js#downloads) and wish to use that instead.
* On Windows, if the location of your `nw.exe` has been added to your `PATH`, then the `NW_PATH` environment variable does not need to be set.

## Packaging

See https://github.com/brzpegasus/ember-cli-node-webkit/issues/6.

## Contribution

### Working with `master`

To install the addon from `master`, run the following:

```
git clone git@github.com:brzpegasus/ember-cli-node-webkit.git 
cd ember-cli-node-webkit
npm link
```

Then, in your Ember CLI project:

* Add `ember-cli-node-webkit` to your `package.json`'s dev dependencies. The version doesn't really matter. The package just needs to be listed so that Ember CLI can discover and register your addon:

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
