# ember-cli-node-webkit

An [ember-cli](http://www.ember-cli.com/) addon for developing Ember.js applications with [NW.js](http://nwjs.io/) (formerly node-webkit).

This addon updates your Ember app with the necessary configuration and scripts to make it run in a NW.js environment.
It also provides a convenient command (`ember nw`) to both build the app and launch it in a NW.js window.

## Usage

```
ember install:addon ember-cli-node-webkit
```

This will install the addon to your Ember CLI project as a dev dependency, and apply the necessary configuration from the `node-webkit` blueprint.

## Command

The addon makes the following command available for you to use in your Ember CLI project:

* `ember nw`

To specify a specific target environment:

* `ember nw --environment (development|production)`

This is the equivalent of running `ember build --watch`, followed by `nw .` to start NW.js, but you get the benefit of running a single command and seeing the output of both running processes in the same terminal window.

As the app gets rebuilt during development, the page that is loaded in the running NW.js window will automatically reload, so you can see the changes that you made without having to stop and restart the entire process.

## NW.js Binary

To develop an Ember app with this addon, you will first need to install the NW.js binary. See the [Download](https://github.com/nwjs/nw.js#downloads) section of the NW.js website.

This addon will try to determine the path to the NW.js executable based on the current platform:

* Mac: `/Applications/node-webkit.app/Contents/MacOS/node-webkit`
* Other: `nw` (assuming it is in your PATH)

You can always change this value by specifying an environment property called `NW_PATH` that points to the binary file. The addon will read in the value via `process.env.NW_PATH` and use it, if present.

## Working with master

To install the addon from `master`, run the following:

```
git clone git@github.com:brzpegasus/ember-cli-node-webkit.git 
cd ember-cli-node-webkit
npm link
```

Then, navigate to your Ember CLI project and add the addon as a dev dependency in your `package.json`. The version doesn't really matter, so long as it satisfies the `npm link`'ed package version. The package just needs to be listed so Ember CLI can discover the addon:

```json
{
  "devDependencies": {
    "ember-cli-node-webkit": "*"
  }
}
```

Finally, run the following to finish installing:

```
npm link ember-cli-node-webkit
npm install
bower install
ember g node-webkit
```
