//throw new Error("Config Node Loaded!");
module.exports = function (RED) {
    function ActiveDirectoryConfigNode(config){
        RED.nodes.createNode(this,config);
        this.url=config.url;
        this.username=config.username;
        this.password=config.password;
    }

    RED.nodes.registerType('activedirectory-config', ActiveDirectoryConfigNode, {
        credentials: {
          username: { type: 'text' },
          password: { type: 'password' }
        }
      })
}
