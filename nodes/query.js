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
      // import activedirectory2
      var ActiveDirectory = require('activedirectory2');
      // set attributes if defined
      if(msg.ad_attributes !== 'undefined'){
        node.ad_attributes = msg.ad_attributes;
      } else{
        node.ad_attributes = {
          user: [
            'dn', 'distinguishedName',
            'userPrincipalName', 'sAMAccountName', 'mail',
            'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
            'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
            'comment', 'description', 'url'
          ],
          group: [
            'dn', 'cn', 'description', 'distinguishedName', 'objectCategory'
          ]
        };
      }
      var adConfig = {
        url: node.url,
        baseDN: node.baseDN,
        username: cUsername,
        password: cPassword,
        attributes: node.ad_attributes
      };
      var ad = new ActiveDirectory(adConfig);
      var _ = require('underscore');
      var query = msg.payload;
      var opts = {
        includeMembership : [ 'group', 'user' ], // Optionally can use 'all'
        includeDeleted : false
      };
      ad.find(query, function(err, results) {
        if (err) {
          node.error('ERROR: ' + JSON.stringify(err));
          return;
        }
        msg.payload = results;
        node.send(msg);
      });
    });
  }

  RED.nodes.registerType("query",queryNode,{
    credentials: {
      username: {type:"text"},
      password: {type:"password"}
    }
  });

}
