module.exports = require('cqrs-domain').defineEvent({
  name: 'productChanged',
},
(data, aggregate) => {
  aggregate.set(data);
});
