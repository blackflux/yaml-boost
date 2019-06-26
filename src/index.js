const fs = require('fs');
const path = require('path');
const objectScan = require('object-scan');
const get = require('lodash.get');
const mergeWith = require('lodash.mergewith');
const yaml = require('js-yaml');

const concatArrays = (objValue, srcValue) => ([objValue, srcValue]
  .every(Array.isArray) ? objValue.concat(srcValue) : undefined);

module.exports.load = (filePath, vars = {}) => {
  const result = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  const rootDir = path.dirname(filePath);
  const relDirStack = [rootDir];
  const varStack = [vars];

  objectScan(['**'], {
    joined: false,
    breakFn: (key, value, { parents }) => {
      if (key[key.length - 1] !== '<<<' && Array.isArray(value)) {
        return true;
      }
      relDirStack.length = Math.max(1, key.length);
      varStack.length = Math.max(1, key.length);
      const relDir = relDirStack[relDirStack.length - 1];
      const vars = varStack[varStack.length - 1];

      if (typeof value === 'string' || value instanceof String) {
        let valueNew = value;
        // replace yaml variables with defaults
        valueNew = valueNew.replace(
          /\${opt:([a-zA-Z0-9]+?)(?:, ["']([a-zA-Z0-9\-.]+?)["'])?}/g,
          (match, k, v) => get(vars, k, v || match)
        );
        // load requires
        const match = (
          /^\${(require|file|fileFn)\(([~^]?[a-zA-Z\d._\-@/]+?)\)(?::([a-zA-Z\d.]+?))?(?:, ([a-zA-Z\d=\-&/.:[\],]+?))?}$/g
        ).exec(valueNew);
        if (match) {
          const varsNew = Object.assign({}, vars, match[4] ? JSON
            .parse(`{"${match[4].replace(/&/g, '","').replace(/=/g, '":"')}"}`) : {});
          varStack.push(varsNew);

          let loaded;
          if (['file', 'fileFn'].includes(match[1])) {
            const filePath = match[2].startsWith('^')
              ? path.join(relDir, match[2].substring(1))
              : path.join(rootDir, match[2]);
            relDirStack.push(path.dirname(filePath));
            loaded = (filePath.endsWith('.yml') || filePath.endsWith('.yaml'))
              ? yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
              // eslint-disable-next-line global-require, import/no-dynamic-require
              : require(filePath);
            if (match[1] === 'fileFn') {
              loaded = loaded(varsNew);
            }
          } else {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            loaded = require(match[2]);
          }
          const target = match[3] ? get(loaded, match[3]) : loaded;
          valueNew = typeof target === 'function' ? target() : target;
        }
        parents[0][key[key.length - 1]] = valueNew
      }
      return false;
    },
    filterFn: (key, value, { parents }) => {
      if (key[key.length - 1] === '<<<' && Array.isArray(value)) {
        value.reduce((prev, cur) => mergeWith(prev, cur, concatArrays), parents[0]);
        delete parents[0]['<<<'];
      }
      return true;
    }
  })(result);
  return result;
};

module.exports.dump = yaml.safeDump;
