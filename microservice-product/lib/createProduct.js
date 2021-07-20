module.exports = require('cqrs-domain').defineCommand({
  name: 'createProduct',
}, (data, aggregate) => {
  data.createdAt = new Date();
  aggregate.apply('productCreated', data);
});
