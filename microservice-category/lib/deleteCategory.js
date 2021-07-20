module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteCategory',
}, (data, aggregate) => {
  aggregate.apply('categoryDeleted', data);
});
