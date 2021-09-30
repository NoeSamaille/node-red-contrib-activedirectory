// throw new Error("Config Node Loaded!");
module.exports = function (RED) {
  function ActiveDirectoryConfigNode(config) {
    RED.nodes.createNode(this, config)
    // get properties
    this.url = config.url
    this.baseDN = config.baseDN
    // get credentials
    this.username = config.username
    this.password = config.password
  }

  RED.nodes.registerType('ad-config', ActiveDirectoryConfigNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })

  // Open a new HTTP endpoint for the Edit-Dialogue-Buttons
  RED.httpAdmin.post('/adconfig', RED.auth.needsPermission('config.read'), async function (req, res) {
    const ActiveDirectory = require('activedirectory2')
    await doConnectionTest(ActiveDirectory, req, res).catch()
  })
}
async function doConnectionTest(ActiveDirectory, req, res) {
  return new Promise((resolve, reject) => {
    try {
      ActiveDirectory.prototype.getRootDSE(req.body.url, ['defaultNamingContext'], function (err, result) {
        if (err) {
          try {
            res.json('Failure')
            console.log('ERROR: ' + JSON.stringify(err))
            resolve()
          } catch (e) {
            // When an error occurs, the callback of getRootDSE gets called twice, which leads to an HTTP error
            // The try-catch-block prevents this, but lets all other errors through to console
            if (e.code !== 'ERR_HTTP_HEADERS_SENT') {
              console.log(e)
            }
            resolve()
          }
        } else {
          if (req.body.mode === 'test') {
            res.json('Success')
          } else if (req.body.mode === 'getBaseDN') {
            console.log('Successfully autofilled baseDN!')
            res.json(result.defaultNamingContext)
          }
          resolve()
        }
      })
    } catch (e) {
      if (req.body.mode === 'test') {
        res.json('ConfigInvalid')
        console.log('No valid url supplied! Try updating your configuration before testing.')
      } else if (req.body.mode === 'getBaseDN') {
        console.log('No valid url supplied! Try updating your configuration before testing.')
        res.json('No valid url supplied! Try updating your configuration before testing.')
      }
      resolve()
    }
  })
}
