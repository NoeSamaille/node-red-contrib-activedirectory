module.exports = function (RED) {
  function queryNode (config) {
    RED.nodes.createNode(this, config)
    const node = this
    const configNode = RED.nodes.getNode(config.configName)
    let cUsername
    let cPassword
    if (configNode) {
      // fetch centralized properties
      node.url = configNode.url
      // Get baseDN
      if (config.baseDN) {
        node.baseDN = config.baseDN
      } else {
        if (configNode.baseDN) {
          node.baseDN = configNode.baseDN
        } else {
          node.warn('You have not configured a baseDN! Therefore the node will attempt to retrieve it during runtime.')
        }
      }
      // fetch centralized credentials
      cUsername = configNode.credentials.username
      cPassword = configNode.credentials.password
    } else {
      node.status({ fill: 'red', shape: 'dot', text: 'configuration error' })
      node.error('ERROR connecting, no valid configuration specified')
    }

    node.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'ring', text: 'connecting' })
      // import activedirectory2
      const ActiveDirectory = require('activedirectory2')
      // Set baseDN if empty
      if (node.baseDN == null) {
        // test AD-connection
        ActiveDirectory.prototype.getRootDSE(node.url, ['defaultNamingContext'], function (err, result) {
          if (err) {
            console.log('ERROR: ' + JSON.stringify(err))
            node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
            node.error('Couldn\'t connect to Activedirectory without a specified baseDN!')
            return null
          }
          // Write the baseDN into the runtime configuration
          const resultBaseDN = result.defaultNamingContext
          node.baseDN = resultBaseDN
          config.baseDN = resultBaseDN
          if (!configNode.baseDN) {
            configNode.baseDN = resultBaseDN
          }
          connectToAD(msg, ActiveDirectory)
        })
      } else {
        connectToAD(msg, ActiveDirectory)
      }
    })

    function connectToAD (msg, ActiveDirectory) {
      const adConfig = formatConfig(msg)
      try {
        queryInAD(ActiveDirectory, adConfig, msg)
      } catch (e) {
        node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
        node.error('ERROR connecting: ' + e.message, msg)
      }
    }

    function queryInAD (ActiveDirectory, adConfig, msg) {
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
    }

    function formatConfig (msg) {
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
      return adConfig
    }
  }

  RED.nodes.registerType('query', queryNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
