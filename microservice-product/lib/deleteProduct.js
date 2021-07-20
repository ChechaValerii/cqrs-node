module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteProduct',
}, (data, aggregate) => {
  aggregate.apply('productDeleted', data);
});
