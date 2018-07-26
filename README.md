[![Build Status](https://img.shields.io/travis/simlu/yaml-boost/master.svg)](https://travis-ci.org/simlu/yaml-boost)
[![Test Coverage](https://img.shields.io/coveralls/simlu/yaml-boost/master.svg)](https://coveralls.io/github/simlu/yaml-boost?branch=master)
[![Dependencies](https://david-dm.org/simlu/yaml-boost/status.svg)](https://david-dm.org/simlu/yaml-boost)
[![NPM](https://img.shields.io/npm/v/yaml-boost.svg)](https://www.npmjs.com/package/yaml-boost)
[![Downloads](https://img.shields.io/npm/dt/yaml-boost.svg)](https://www.npmjs.com/package/yaml-boost)
[![Semantic-Release](https://github.com/simlu/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)
[![Gitter](https://github.com/simlu/js-gardener/blob/master/assets/icons/gitter.svg)](https://gitter.im/simlu/yaml-boost)

# Yaml-Boost

Basic Yaml Loading with additional functionality, i.e. resolve file depedencies, resolve variables, deep merge hierachies.

Useful for loading improved [serverless](https://serverless.com/) configuration. For yaml loading this package uses [js-yaml](https://github.com/nodeca/js-yaml).

## Getting Started

    $ npm install --save yaml-boost

## Usage

<!-- eslint-disable import/no-unresolved, import/no-extraneous-dependencies -->
```js
const yaml = require("yaml-boost");

yaml.load("config.yaml");
```

Matching `yaml.dump()` function is also available.

### Variable and File Resolution

Works identical to how this is defined for serverless [here](https://serverless.com/framework/docs/providers/aws/guide/variables/).

#### Extensions

##### Bake variables when loading files

```yaml
${file(./path/to/file.yml), key1=value1&key2=value2}
```

##### Reference Packages

You can reference packages by using

```yaml
${require(PACKAGE):path.to.key.in.module}
```

##### Reference Js files

Reference js instead of yaml files.

```yaml
${file(./path/to/file.js)}
```

The reference file needs to export simple object containing configuration

```js
module.exports = {};
```

##### Relative File References

Once can reference files relative to the current file by using `^` as a prefix like so

```yaml
${file(^/subfolder/of/current/file.yml)}
``` 

##### Deep Merge

Analogue to the `<<` yaml syntax we can use `<<<` to deep merge into the current nesting level.
This is helpful when merging files into already existing hierarchies.

Example:

```yaml
data:
  - list entry one

<<<:
  - data:
      - list entry two
  - other: things
```

results in

```yaml
data:
  - list entry one
  - list entry two
other: things
```

## Serverless Example

Define `serverless.js` as

<!-- eslint-disable import/no-unresolved, import/no-extraneous-dependencies -->
```js
const path = require("path");
const optimist = require('optimist');
const yaml = require("yaml-boost");

module.exports = yaml.load(path.join(__dirname, "serverless.core.yml"), optimist.argv);
```

Then instead of defining `serverless.yml`, define your config in `serverless.core.yml`.
