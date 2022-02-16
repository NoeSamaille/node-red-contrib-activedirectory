module.exports = function (RED) {
  function findGroupNode (config) {
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
        findGroupInAD(ActiveDirectory, adConfig, msg)
      } catch (e) {
        node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
        node.error('ERROR connecting: ' + e.message, msg)
      }
    }

    function findGroupInAD (ActiveDirectory, adConfig, msg) {
      const ad = new ActiveDirectory(adConfig)
      node.status({ fill: 'green', shape: 'dot', text: 'connected' })
      // Find group by his DN
      const dn = msg.payload
      node.status({ fill: 'blue', shape: 'ring', text: 'querying' })
      ad.findGroup(dn, function (err, group) {
        if (err) {
          const errTxt = 'ERROR querying: ' + JSON.stringify(err)
          node.status({ fill: 'red', shape: 'dot', text: errTxt })
          node.error(errTxt, msg)
        } else if (!group) {
          const errTxt = 'Group ' + dn + ' not found.'
          delete msg.payload
          msg.ad_error = errTxt
          node.status({ fill: 'yellow', shape: 'dot', text: errTxt })
          node.send(msg)
        } else {
          msg.payload = group
          node.status({ fill: 'green', shape: 'dot', text: 'Group ' + dn + ' found' })
          node.send(msg)
        }
      })
    }

    function formatConfig (msg) {
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
      return adConfig
    }
  }

  RED.nodes.registerType('find-group', findGroupNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
