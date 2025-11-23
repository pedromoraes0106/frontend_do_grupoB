const assert = require("chai").assert;
const app = require("../src/index");

describe("App", function () {
  it("should have express app defined", function () {
    it("App should be defined", function () {
      assert.isDefined(app, "Express app is not defined");
    });
  });
});
