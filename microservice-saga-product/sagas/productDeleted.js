module.exports = require('cqrs-saga').defineSaga({
  name: 'productDeleted',
  aggregate: 'product',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
(evt, saga, callback) => {
  const productId = evt.payload.id;

  const ordersRepo = require('../viewBuilders/order/collection');
  ordersRepo.findViewModels({ 'products.id': productId }, (err, orders) => {
    orders.forEach((entry) => {
      const cmd = {
        command: 'deleteOrder',
        aggregate: {
          name: 'order',
        },
        payload: {
          id: entry.id,
        },
        meta: evt.meta,
      };

      saga.addCommandToSend(cmd);
    });

    saga.commit(callback);
  });
});
