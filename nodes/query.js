module.exports = function (RED) {
  function queryNode (config) {
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
    node.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'ring', text: 'connecting' })
      // import activedirectory2
      const ActiveDirectory = require('activedirectory2')
      const adConfig = {
        url: node.url,
        baseDN: node.baseDN,
        tlsOptions: node.tlsOptions,
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
        const query = msg.payload
        // const opts = {
        //  includeMembership: ['group', 'user'], // Optionally can use 'all'
        //  includeDeleted: false
        // }
        node.status({ fill: 'blue', shape: 'ring', text: 'querying' })
        ad.find(query, function (err, results) {
          if (err) {
            node.status({ fill: 'red', shape: 'dot', text: 'error querying' })
            node.error('ERROR querying: ' + JSON.stringify(err), msg)
          } else {
            msg.payload = results
            node.status({ fill: 'green', shape: 'dot', text: 'query successful' })
            node.send(msg)
          }
        })
      } catch (e) {
        node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
        node.error('ERROR connecting: ' + e.message, msg)
      }
    })
  }

  RED.nodes.registerType('query', queryNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
