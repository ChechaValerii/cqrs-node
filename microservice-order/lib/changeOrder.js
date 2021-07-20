module.exports = require('cqrs-domain').defineCommand({
  name: 'changeOrder',
}, (data, aggregate) => {
  aggregate.apply('orderChanged', data);
});
