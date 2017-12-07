var helper = require('../helper.js');

describe('query node Testing', function () {

  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  var testNode = require("../../nodes/query.js");
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
