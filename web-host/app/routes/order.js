exports.actions = function (app, options, repository) {
  const orderRepo = repository.extend({
    collectionName: 'order',
  });

  app.get('/api/order', (req, res) => {
    orderRepo.find((err, orders) => {
      if (err) {
        return res.send('error', { error: err });
      }

      return res.json({ items: orders });
    });
  });

  app.get('/api/order/:id', (req, res) => {
    const orderId = req.params.id;
    orderRepo.get(orderId, (err, order) => {
      if (err) {
        return res.send('error', { error: err });
      }

      if (order == null) {
        res.statusCode = 404;
        return res.send({ error: 'Something failed!' });
      }

      return res.json(order);
    });
  });
};
