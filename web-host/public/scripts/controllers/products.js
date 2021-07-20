app

  .controller('ProductsCtrl', ['$scope', 'StoreService', '$filter', 'uploadImage', 'user',
    function ($scope, StoreService, $filter, uploadImage, user) {
      $scope.aggregate = 'product';

      const store = StoreService.createForController($scope);
      store.for($scope.aggregate).do(() => {
      });

      $scope.user = user;

      $scope.units = {
        pc: 'Piece',
        kg: 'Kilogram',
        g: 'Gram',
        m: 'Meter',
        l: 'Liter',
      };

      $scope.statuses = {
        published: 'published',
        notPublished: 'not published',
        banned: 'banned',
      };

      $scope.uploadImages = function (files, user, cb) {
        if (files && files.length) {
          uploadImage.uploadMultiple(files, user, cb);
        }
      };

      $scope.product = {};
    }])

  .controller('ProductsListCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$filter', 'ngTableParams', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $filter, ngTableParams, toastr, _) {
      const eventName = 'productDeleted';
      const commandName = 'deleteProduct';

      const categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventName, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        const existingProduct = $filter('filter')($scope.products, { id: data.payload.id }, true)[0];

        const index = $scope.products.indexOf(existingProduct);
        if (index > -1) {
          $scope.products.splice(index, 1);
        }

        toastr.success('Product Removed!', 'Product has been removed');
      });

      // Delete CRUD operation
      $scope.delete = function (category) {
        if (confirm('Are you sure?')) {
          CQRS.sendCommand({
            id: _.uniqueId('msg'),
            command: commandName,
            aggregate: {
              name: $scope.aggregate,
            },
            payload: {
              id: category.id,
            },
          });
        }
      };
      /// ///////////////////////// *Delete CRUD operation

      // Initialize table
      const getCategoriesPromise = categoryRepository.query().$promise;
      getCategoriesPromise
        .then((result) => {
          $scope.categories = result.items;

          return productRepository.query().$promise;
        })
        .then((result) => {
          $scope.products = result.items;

          // extend array
          function extendArray() {
            angular.forEach($scope.products, (value, key) => {
              if (value.categoryId) {
                const existingCategory = $filter('filter')($scope.categories, { id: value.categoryId }, true)[0];
                if (existingCategory != null && existingCategory != undefined) {
                  value.category = existingCategory;
                }
              }
            });
          }
          extendArray();
          /// ////////////////////////////////////////// *extend array

          // watch data in scope, if change reload table
          $scope.$watchCollection('products', (newVal, oldVal) => {
            if (newVal !== oldVal) {
              extendArray();
              $scope.tableParams.reload();
            }
          });

          $scope.$watch('searchText', (newVal, oldVal) => {
            if (newVal !== oldVal) {
              $scope.tableParams.reload();
            }
          });
          /// ////////////////////////////////////////// *watch data in scope, if change reload table

          $scope.tableParams = new ngTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
              id: 'asc', // initial sorting
            },
          }, {
            total: $scope.products.length, // length of data
            getData($defer, params) {
              // use build-in angular filter
              let orderedData = params.sorting()
                ? $filter('orderBy')($scope.products, params.orderBy())
                : $scope.products;

              orderedData = $filter('filter')(orderedData, $scope.searchText);
              params.total(orderedData.length);

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            },
          });
        });
      /// /////////////////////////////////////// *Initialize table
    }])

  .controller('NewProductCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$state', '$filter', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $state, $filter, toastr, _) {
      const eventName = 'productCreated';
      const commandName = 'createProduct';

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        toastr.success('Product Added!', 'Product has been created');
        $state.go('app.products.list', {}, { reload: true });
      });

      // Submit operation
      $scope.ok = function (form) {
        let x = 0;
        const cb = function (filelink) {
          $scope.product.images[x] = {};
          $scope.product.images[x].src = filelink;
          x++;
          if ($scope.product.images.length === x) {
            $scope.product.images = angular.copy($scope.product.images);
            CQRS.sendCommand({
              id: _.uniqueId('msg'),
              command: commandName,
              aggregate: {
                name: $scope.aggregate,
              },
              payload: $scope.product,
            });
          }
        };

        if (form.images.$valid) {
          $scope.uploadImages($scope.product.images, $scope.user, cb);
        }
      };
      /// //////////////////// *Submit operation

      const getCategoriesPromise = categoryRepository.query().$promise;
      getCategoriesPromise
        .then((result) => {
          $scope.categories = result.items;

          $scope.childCategories = [];
          // extend array
          angular.forEach($scope.categories, (value, key) => {
            if (value.parentId) {
              const existingCategory = $filter('filter')($scope.categories, { id: value.parentId }, true)[0];
              if (existingCategory != null && existingCategory != undefined) {
                value.parentName = existingCategory.name;
                $scope.childCategories.push(value);
              }
            } else if ($filter('filter')($scope.categories, { parentId: value.id }).length === 0) {
              $scope.childCategories.push(value);
            }
          });
        });
    }])

  .controller('EditProductCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'productRepository', 'categoryRepository', '$state', '$stateParams', '$filter', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, productRepository, categoryRepository, $state, $stateParams, $filter, toastr, _) {
      $scope.editing = true;

      const productId = $stateParams.id;
      const eventName = 'productChanged';
      const commandName = 'changeProduct';

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        toastr.success('Product Saved!', 'Product has been saved');
        $state.go('app.products.list', {}, { reload: true });
      });

      // Submit operation
      $scope.ok = function (form) {
        let x = 0;

        const sendCommand = function (filelink) {
          $scope.product.images = angular.copy($scope.product.images);
          CQRS.sendCommand({
            id: _.uniqueId('msg'),
            command: commandName,
            aggregate: {
              name: $scope.aggregate,
            },
            payload: $scope.product,
          });
        };

        const cb = function (filelink) {
          if (filelink) {
            $scope.product.images[x] = {
              src: filelink,
            };
            x++;
          }

          if ($scope.product.images.length === x) {
            sendCommand();
          }
        };

        if (form.images.$modelValue[0] && form.images.$modelValue[0].lastModified && form.images.$valid) {
          $scope.uploadImages($scope.product.images, $scope.user, cb);
        } else {
          sendCommand();
        }
      };
      /// //////////////////// *Submit operation

      const getProductPromise = productRepository.get({ id: productId }).$promise;
      getProductPromise
        .then((result) => {
          $scope.product = result;
          return categoryRepository.query().$promise;
        }, () => {
          $state.go('app.products.list', {}, { reload: true });
        })
        .then((result) => {
          $scope.categories = result.items;

          $scope.childCategories = [];
          // extend array
          angular.forEach($scope.categories, (value, key) => {
            if (value.parentId) {
              const existingCategory = $filter('filter')($scope.categories, { id: value.parentId }, true)[0];
              if (existingCategory != null && existingCategory != undefined) {
                value.parentName = existingCategory.name;
                $scope.childCategories.push(value);
              }
            } else if ($filter('filter')($scope.categories, { parentId: value.id }).length === 0) {
              $scope.childCategories.push(value);
            }
          });
        });
    }])

  .controller('ShowProductCtrl', ['$scope', 'productRepository', 'categoryRepository', '$state', '$stateParams', '$filter',
    function ($scope, productRepository, categoryRepository, $state, $stateParams, $filter) {
      const productId = $stateParams.id;

      const getProductPromise = productRepository.get({ id: productId }).$promise;
      getProductPromise
        .then((result) => {
          $scope.product = result;
          return categoryRepository.get({ id: $scope.product.categoryId }).$promise;
        }, () => {
          $state.go('app.products.list', {}, { reload: true });
        })
        .then((result) => {
          $scope.product.category = result;
        });
    }]);
