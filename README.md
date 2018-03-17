[![Build Status](https://img.shields.io/travis/simlu/yaml-boost/master.svg)](https://travis-ci.org/simlu/yaml-boost)
[![Test Coverage](https://img.shields.io/coveralls/simlu/yaml-boost/master.svg)](https://coveralls.io/github/simlu/yaml-boost?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/simlu/yaml-boost.svg)](https://greenkeeper.io/)
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

<!-- eslint-disable import/no-unresolved -->
```js
const yaml = require("yaml-boost");

yaml.load("input.yaml");
```

### Deep Merge

...

### File Resolution

...

### Variable Resolution

...
