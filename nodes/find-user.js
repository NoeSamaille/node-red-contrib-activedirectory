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
      // Find user by his DN
      var dn = msg.payload;
      ad.findUser(dn, function(err, user) {
        if (err) {
          node.error('ERROR: ' + JSON.stringify(err));
          return;
        }
        if (! user) node.error('User: ' + dn + ' not found.');
        else {
          msg.payload = user;
          node.send(msg);
        }
      });
    });
  }

  RED.nodes.registerType("find-user",findUserNode,{
    credentials: {
      username: {type:"text"},
      password: {type:"password"}
    }
  });

}
