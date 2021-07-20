module.exports = require('cqrs-domain').defineEvent({
  name: 'productCreated',
},
(data, aggregate) => {
  aggregate.set(data);
});
