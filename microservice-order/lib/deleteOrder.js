module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteOrder',
}, (data, aggregate) => {
  aggregate.apply('orderDeleted', data);
});
