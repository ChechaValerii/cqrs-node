module.exports = require('cqrs-domain').defineEvent({
  name: 'orderCreated',
},
(data, aggregate) => {
  aggregate.set(data);
});
