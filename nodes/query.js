module.exports = function(RED) {

  function queryNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    // we get the properties
    node.url = config.url;
    node.baseDN = config.baseDN;
    // we get the credentials
    var cUsername = this.credentials.username;
    var cPassword = this.credentials.password;
    node.on('input', function(msg) {
      node.status({fill:"blue", shape:"ring", text:"connecting"});
      // import activedirectory2
      var ActiveDirectory = require('activedirectory2');
      var adConfig = {
        url: node.url,
        baseDN: node.baseDN,
        username: cUsername,
        password: cPassword
      };
      // set attributes if defined
      if (msg.ad_attributes) {
        // Validates the Object format (required for IBMi platform)
        adConfig.attributes = JSON.parse(JSON.stringify(msg.ad_attributes));
      }
      try {
        var ad = new ActiveDirectory(adConfig);
        node.status({fill:"green", shape:"dot", text:"connected"});
        var query = msg.payload;
        var opts = {
          includeMembership : [ 'group', 'user' ], // Optionally can use 'all'
          includeDeleted : false
        };
        node.status({fill:"blue",shape:"ring",text:"querying"});
        ad.find(query, function(err, results) {
          if (err) {
            node.status({fill:"red", shape:"dot", text:"error querying"});
            node.error('ERROR querying: ' + JSON.stringify(err));
            return;
          }
          msg.payload = results;
          node.status({});
          node.send(msg);
        });
      } catch(e) {
        node.status({fill:"red", shape:"dot", text:"connexion error"});
        node.error('ERROR connecting: ' + e.message);
      }
    });
  }

  RED.nodes.registerType("query",queryNode,{
    credentials: {
      username: {type:"text"},
      password: {type:"password"}
    }
  });

}
