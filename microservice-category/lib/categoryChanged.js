module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryChanged',
},
(data, aggregate) => {
  aggregate.set(data);
});
