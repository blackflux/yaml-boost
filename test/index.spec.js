const expect = require('chai').expect;
const path = require("path");
const yaml = require("./../src/index");

const variablesFile = path.join(__dirname, "resources", 'variables.yml');
const mergeFile = path.join(__dirname, "resources", 'merge.yml');
const parentFile = path.join(__dirname, "resources", 'parent.yml');

describe("Testing Yaml", () => {
  it("Testing Variable Undefined", () => {
    expect(yaml.load(variablesFile)).to.deep.equal({
      // eslint-disable-next-line no-template-curly-in-string
      plain: '${opt:test}', default: 'default'
    });
  });

  it("Testing Variable Provided", () => {
    expect(yaml.load(variablesFile, { test: "value" })).to.deep.equal({
      plain: 'value', default: 'value'
    });
  });

  it("Testing Merge", () => {
    expect(yaml.load(mergeFile)).to.deep.equal({
      a: { b: "c", d: "e", list: ["x", "y", "z"] }
    });
  });

  it("Testing File Resolution", () => {
    expect(yaml.load(parentFile)).to.deep.equal({
      child: { key: "value" },
      childValue: "value",
      childBaked: { key: "value" },
      childJs: { key: "value" }
    });
  });
});
