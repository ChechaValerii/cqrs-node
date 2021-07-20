module.exports = require('cqrs-domain').defineEvent({
  name: 'orderChanged',
},
(data, aggregate) => {
  aggregate.set(data);
});
