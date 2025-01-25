import fs from 'fs';
import path from 'path';
import get from 'lodash.get';
import set from 'lodash.set';
import mergeWith from 'lodash.mergewith';
import yaml from 'js-yaml';

const concatArrays = (objValue, srcValue) => ([objValue, srcValue]
  .every(Array.isArray) ? objValue.concat(srcValue) : undefined);

const loadRecursive = async (dir, relDir, data, vars) => {
  let result = data;
  if (typeof result === 'string' || result instanceof String) {
    // replace yaml variables with defaults
    result = result.replace(
      /\${opt:([a-zA-Z0-9]+?)(?:, ["']([a-zA-Z0-9\-.]+?)["'])?}/g,
      (match, k, v) => get(vars, k, v || match)
    );
    // load requires
    const match = (
      /^\${(require|file|fileFn)\(([~^]?[a-zA-Z\d._\-@/]+?)\)(?::([a-zA-Z\d.]+?))?(?:, ([a-zA-Z\d=\-&/.:[\],]+?))?}$/g
    ).exec(result);
    if (match) {
      const varsNew = {
        ...vars,
        ...(match[4] ? JSON
          .parse(`{"${match[4].replace(/&/g, '","').replace(/=/g, '":"')}"}`) : {})
      };

      let loaded;
      let newRelDir = relDir;
      if (['file', 'fileFn'].includes(match[1])) {
        const filePath = match[2].startsWith('^')
          ? path.join(relDir, match[2].substring(1))
          : path.join(dir, match[2]);
        newRelDir = path.dirname(filePath);
        loaded = (filePath.endsWith('.yml') || filePath.endsWith('.yaml'))
          ? yaml.load(fs.readFileSync(filePath, 'utf8'))
          : (await import(filePath)).default;
        if (match[1] === 'fileFn') {
          loaded = loaded(varsNew);
        }
      } else {
        loaded = await import(match[2]);
        if ('default' in loaded) {
          loaded = loaded.default;
        }
      }
      const target = match[3] ? get(loaded, match[3]) : loaded;
      result = await loadRecursive(dir, newRelDir, typeof target === 'function' ? target() : target, varsNew);
    }
  }
  if (result instanceof Object) {
    const toMerge = await Promise.all(
      get(result, '<<<', [])
        .map((e) => loadRecursive(dir, relDir, e, vars))
    );
    delete result['<<<'];
    const keys = Object.keys(result);
    const values = await Promise.all(keys
      .map((key) => loadRecursive(dir, relDir, get(result, key), vars)));
    keys.forEach((key, idx) => set(result, key, values[idx]));
    result = toMerge.reduce((prev, cur) => mergeWith(prev, cur, concatArrays), result);
  }
  return result;
};

export const resolve = async (refPath, content, vars) => {
  const dirname = path.dirname(refPath);
  return loadRecursive(dirname, dirname, yaml.load(content), vars);
};

export const load = (filePath, vars = {}) => resolve(
  filePath,
  fs.readFileSync(filePath, 'utf8'),
  vars
);

export const dump = yaml.dump;
