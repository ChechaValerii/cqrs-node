module.exports = require('cqrs-domain').defineCommand({
  name: 'changeStatusOrder',
}, (data, aggregate) => {
  aggregate.apply('orderStatusChanged', data);
});
