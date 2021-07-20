module.exports = require('cqrs-domain').defineEvent({
  name: 'productDeleted',
},
(data, aggregate) => {
  aggregate.destroy();
});
