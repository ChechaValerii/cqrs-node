module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryCreated',
},
(data, aggregate) => {
  aggregate.set(data);
});
