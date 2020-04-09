var helper = require("node-red-node-test-helper");
var testNode = require("../nodes/find-group.js");

helper.init(require.resolve('node-red'));

describe('find-group node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });
  
  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "find-group", name: "find-group" }];
    helper.load(testNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'find-group');
      done();
    });
  });

});
