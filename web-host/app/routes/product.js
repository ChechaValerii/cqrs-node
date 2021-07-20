exports.actions = function (app, options, repository) {
  const productRepo = repository.extend({
    collectionName: 'product',
  });

  app.get('/api/product', (req, res) => {
    productRepo.find((err, products) => {
      if (err) {
        return res.send('error', { error: err });
      }

      return res.json({ items: products });
    });
  });

  app.get('/api/product/:id', (req, res) => {
    const productId = req.params.id;
    productRepo.get(productId, (err, product) => {
      if (err) {
        return res.send('error', { error: err });
      }

      if (product == null) {
        res.statusCode = 404;
        return res.send({ error: 'Something failed!' });
      }

      return res.json(product);
    });
  });
};
