module.exports = require('cqrs-domain').defineEvent({
  name: 'categoryDeleted',
},
(data, aggregate) => {
  aggregate.destroy();
});
