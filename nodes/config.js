//throw new Error("Config Node Loaded!");
module.exports = function (RED) {
    function ActiveDirectoryConfigNode(config){
        RED.nodes.createNode(this,config);
        //get properties
        this.url=config.url;
        //get credentials
        this.username=config.username;
        this.password=config.password;
    }

    RED.nodes.registerType('ad-config', ActiveDirectoryConfigNode, {
        credentials: {
          username: { type: 'text' },
          password: { type: 'password' }
        }
      })
}
