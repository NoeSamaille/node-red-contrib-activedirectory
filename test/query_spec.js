var helper = require("node-red-node-test-helper");
var testNode = require("../nodes/query.js");

helper.init(require.resolve('node-red'));

describe('query node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });
  
  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('should be loaded', function(done) {
      helper.load(testNode, [{
        id: "node_1",
        name: "query",
        type: "query"
      }], function() {
          var node_1 = helper.getNode("node_1");
          node_1.should.have.property('name', 'query');
          done();
      });
  });

});
