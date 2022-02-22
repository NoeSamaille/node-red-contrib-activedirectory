module.exports = function (RED) {
  'use strict'

  const ActiveDirectory = require('activedirectory2')

  function findGroupNode (config) { // eslint-disable-line no-unused-vars
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
        node.log('No baseDN configured. Trying lookup ...')
        ActiveDirectory.prototype.getRootDSE(node.url, ['defaultNamingContext'], function (err, result) {
          if (err) {
            node.error('ERROR (baseDN-Lookup): ' + JSON.stringify(err))
            return
          }
          node.log('Got baseDN from AD -> ' + JSON.stringify(result.defaultNamingContext))
          node.status({ fill: 'blue', shape: 'ring', text: 'baseDN: "' + result.defaultNamingContext + '"' })
          node.baseDN = result.defaultNamingContext
        })
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
      } catch (e) {
        node.status({ fill: 'red', shape: 'dot', text: 'connection error' })
        node.error('ERROR connecting: ' + e.message, msg)
      }
    })
  }

  RED.nodes.registerType('find-group', findGroupNode)
}
