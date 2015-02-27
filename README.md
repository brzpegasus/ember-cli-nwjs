# ember-cli-node-webkit

An [ember-cli](http://www.ember-cli.com/) addon for developing Ember.js applications with [NW.js](http://nwjs.io/) (formerly node-webkit).

This addon updates your Ember app with the necessary configuration and scripts to make it run in a NW.js environment.
It also provides a convenient command (`ember nw`) to both build the app and launch it in a NW.js window.

## Usage

* `ember addon:install ember-cli-node-webkit`

or

* `npm install --save-dev ember-cli-node-webkit`
* `ember g node-webkit`

## Command

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