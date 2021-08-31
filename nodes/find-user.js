module.exports = function (RED) {
  function findUserNode (config) {
    RED.nodes.createNode(this, config)
    const node = this
    var configNode=RED.nodes.getNode(config.configName);
    var cUsername;
    var cPassword;
    if(configNode){
      //fetch centralized properties
      node.url=configNode.url;
      //Get Overloaded baseDN, prioritize Node-specific config
      if(config.baseDN){
        node.baseDN=config.baseDN;
      }else{
        node.baseDN=configNode.baseDN;
      }
      //fetch centralized credentials
      cUsername = configNode.credentials.username;
      cPassword = configNode.credentials.password;
    }else{
      node.status({ fill: 'red', shape: 'dot', text: 'configuration error' })
      node.error('ERROR connecting, no valid configuration specified')
    }
    this.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'ring', text: 'connecting' })
      // import activedirectory2
      const ActiveDirectory = require('activedirectory2')
      const adConfig = {
        url: node.url,
        baseDN: node.baseDN,
        username: cUsername,
        password: cPassword
      }
      // set attributes if defined
      if (msg.ad_attributes) {
        // Validates the Object format (required for IBMi platform)
        adConfig.attributes = JSON.parse(JSON.stringify(msg.ad_attributes))
      }
      if (msg.tlsOptions) {
        // Validates the Object format (required for IBMi platform)
        adConfig.tlsOptions = JSON.parse(JSON.stringify(msg.tlsOptions))
      }
      try {
        const ad = new ActiveDirectory(adConfig)
        node.status({ fill: 'green', shape: 'dot', text: 'connected' })
        // Find user by his DN
        const dn = msg.payload
        node.status({ fill: 'blue', shape: 'ring', text: 'querying' })
        ad.findUser(dn, function (err, user) {
          if (err) {
            const errTxt = 'ERROR querying: ' + JSON.stringify(err)
            node.status({ fill: 'red', shape: 'dot', text: 'error querying' })
            node.error(errTxt)
          } else if (!user) {
            const errTxt = 'User ' + dn + ' not found'
            delete msg.payload
            msg.ad_error = errTxt
            node.status({ fill: 'yellow', shape: 'dot', text: errTxt })
            node.send(msg)
          } else {
            msg.payload = user
            node.status({ fill: 'green', shape: 'dot', text: 'user' + dn + 'found' })
            node.send(msg)
          }
        })
      } catch (e) {
        const errTxt = 'ERROR connecting: ' + e.message
        node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
        node.error(errTxt, msg)
      }
    })
  }

  RED.nodes.registerType('find-user', findUserNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
