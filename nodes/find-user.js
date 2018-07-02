module.exports = function(RED) {

  function findUserNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    // we get the properties
    node.url = config.url;
    node.baseDN = config.baseDN
    // we get the credentials
    var cUsername = this.credentials.username;
    var cPassword = this.credentials.password;
    node.on('input', function(msg) {
      node.status({fill:"blue",shape:"ring",text:"connecting"});
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
        node.status({fill:"green",shape:"dot",text:"connected"});
        // Find user by his DN
        var dn = msg.payload;
        node.status({fill:"blue",shape:"ring",text:"querying"});
        ad.findUser(dn, function(err, user) {
          if (err) {
            node.status({fill:"red", shape:"dot", text:"error querying"});
            node.error('ERROR querying: ' + JSON.stringify(err));
            return;
          }
          if (! user) {
            node.status({fill:"red", shape:"dot", text:"user not found"});
            node.error('User: ' + dn + ' not found.');
          }else {
            msg.payload = user;
            node.status({});
            node.send(msg);
          }
        });
      } catch(e) {
        node.status({fill:"red", shape:"dot", text:"connexion error"});
        node.error('ERROR connecting: ' + e.message);
      }
    });
  }

  RED.nodes.registerType("find-user",findUserNode,{
    credentials: {
      username: {type:"text"},
      password: {type:"password"}
    }
  });

}
