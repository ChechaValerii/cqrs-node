module.exports = require('cqrs-domain').defineCommand({
  name: 'changeProduct',
}, (data, aggregate) => {
  aggregate.apply('productChanged', data);
});
