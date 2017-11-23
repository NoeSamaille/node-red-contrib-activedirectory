module.exports = function(RED) {
    function adUserNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            // Code goes here
        });
    }
    RED.nodes.registerType("ad-user",adUserNode);
}
