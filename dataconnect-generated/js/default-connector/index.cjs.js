const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'stablehand-typing',
  location: 'us-west2'
};
exports.connectorConfig = connectorConfig;

