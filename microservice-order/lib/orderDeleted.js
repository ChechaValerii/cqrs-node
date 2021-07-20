module.exports = require('cqrs-domain').defineEvent({
  name: 'orderDeleted',
},
(data, aggregate) => {
  aggregate.destroy();
});
