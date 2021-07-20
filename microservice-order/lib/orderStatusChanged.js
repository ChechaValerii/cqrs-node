module.exports = require('cqrs-domain').defineEvent({
  name: 'orderStatusChanged',
},
(data, aggregate) => {
  aggregate.set(data);
});
