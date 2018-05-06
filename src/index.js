const fs = require("fs");
const path = require("path");
const get = require('lodash.get');
const set = require('lodash.set');
const mergeWith = require('lodash.mergewith');
const yaml = require('js-yaml');

const concatArrays = (objValue, srcValue) => ([objValue, srcValue]
  .every(Array.isArray) ? objValue.concat(srcValue) : undefined);

const loadRecursive = (dir, data, vars) => {
  let result = data;
  if (typeof result === 'string' || result instanceof String) {
    // replace yaml variables with defaults
    result = result.replace(
      /\${opt:([a-zA-Z0-9]+?)(?:, ["']([a-zA-Z0-9-.]+?)["'])?}/g,
      (match, k, v) => get(vars, k, v || match)
    );
    // load referenced yaml file
    const match = (
      /^\${file\((~?[a-zA-Z0-9._/-]+?)\)(?::([a-zA-Z0-9.]+?))?(?:, ([a-zA-Z0-9=&-]+?))?}$/g.exec(result)
    );
    if (match) {
      const filePath = path.join(dir, match[1]);
      const loaded = filePath.endsWith(".yml")
        ? yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
        // eslint-disable-next-line global-require, import/no-dynamic-require
        : require(filePath);
      result = loadRecursive(
        dir,
        match[2] ? get(loaded, match[2]) : loaded,
        Object.assign({}, vars, match[3] ? JSON
          .parse(`{"${match[3].replace(/&/g, "\",\"").replace(/=/g, "\":\"")}"}`) : {})
      );
    }
  }
  if (result instanceof Object) {
    const toMerge = get(result, "<<<", []).map(e => loadRecursive(dir, e, vars));
    delete result["<<<"];
    Object.keys(result).forEach(key => set(result, key, loadRecursive(dir, get(result, key), vars)));
    result = toMerge.reduce((prev, cur) => mergeWith(prev, cur, concatArrays), result);
  }
  return result;
};

module.exports.load = (filePath, vars = {}) => loadRecursive(
  path.dirname(filePath),
  yaml.safeLoad(fs.readFileSync(filePath, 'utf8')),
  vars
);
