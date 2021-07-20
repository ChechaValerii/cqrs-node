module.exports = require('cqrs-domain').defineCommand({
  name: 'changeCategory',
}, (data, aggregate) => {
  aggregate.apply('categoryChanged', data);
});
