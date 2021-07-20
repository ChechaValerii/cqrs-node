module.exports = require('cqrs-saga').defineSaga({
  name: 'categoryDeleted',
  aggregate: 'category',
  containingProperties: ['payload.id'],
  id: 'payload.id',
},
(evt, saga, callback) => {
  const categoryId = evt.payload.id;

  const productsRepo = require('../viewBuilders/product/collection');
  productsRepo.findViewModels({ categoryId }, (err, products) => {
    products.forEach((entry) => {
      const cmd = {
        command: 'deleteProduct',
        aggregate: {
          name: 'product',
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
