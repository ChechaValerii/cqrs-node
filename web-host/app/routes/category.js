exports.actions = function (app, options, repository) {
  const categoryRepo = repository.extend({
    collectionName: 'category',
  });

  app.get('/api/category', (req, res) => {
    categoryRepo.find((err, categories) => {
      if (err) {
        return res.send('error', { error: err });
      }

      return res.json({ items: categories });
    });
  });

  app.get('/api/category/:id', (req, res) => {
    const categoryId = req.params.id;
    categoryRepo.get(categoryId, (err, category) => {
      if (err) {
        return res.send('error', { error: err });
      }

      if (category == null) {
        res.statusCode = 404;
        return res.send({ error: 'Something failed!' });
      }

      return res.json(category);
    });
  });
};
