import path from 'path';
import fs from 'smart-fs';
import * as chai from 'chai';
import * as yaml from '../src/index.js';

const { expect } = chai;

const variablesFile = path.join(fs.dirname(import.meta.url), 'resources', 'variables.yml');
const mergeFile = path.join(fs.dirname(import.meta.url), 'resources', 'merge.yml');
const parentFile = path.join(fs.dirname(import.meta.url), 'resources', 'parent.yml');

describe('Testing Yaml', () => {
  it('Testing Variable Undefined', async () => {
    expect(await yaml.load(variablesFile)).to.deep.equal({
      // eslint-disable-next-line no-template-curly-in-string
      plain: '${opt:test}', default: 'default.dot'
    });
  });

  it('Testing Variable Provided', async () => {
    expect(await yaml.load(variablesFile, { test: 'value' })).to.deep.equal({
      plain: 'value', default: 'value'
    });
  });

  it('Testing Merge', async () => {
    expect(await yaml.load(mergeFile)).to.deep.equal({
      a: { b: 'c', d: 'e', list: ['x', 'y', 'z'] }
    });
  });

  it('Testing File Resolution', async () => {
    expect(await yaml.load(parentFile)).to.deep.equal({
      child: { key: 'value' },
      childValue: 'value',
      childBaked: { key: 'value' },
      childJs: { key: 'value' },
      childFn: { key: { variable: 'value' } },
      childRequireKey: { key: chai.version },
      childRequireFn: { key: path.join() },
      childRequire: { key: chai },
      childDir: { grandchild: { key: 'value' } }
    });
  });
});
