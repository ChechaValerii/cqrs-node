module.exports = require('cqrs-domain').defineCommand({
  name: 'createCategory',
}, (data, aggregate) => {
  data.createdAt = new Date();
  aggregate.apply('categoryCreated', data);
});
