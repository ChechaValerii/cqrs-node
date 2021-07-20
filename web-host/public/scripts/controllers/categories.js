app

  .controller('CategoriesCtrl', ['$scope', 'StoreService',
    function ($scope, StoreService) {
      $scope.aggregate = 'category';

      const store = StoreService.createForController($scope);
      store.for($scope.aggregate).do(() => {
      });

      $scope.category = {};
    }])

  .controller('CategoriesListCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'categoryRepository', '$filter', 'ngTableParams', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, categoryRepository, $filter, ngTableParams, toastr, _) {
      const eventName = 'categoryDeleted';
      const commandName = 'deleteCategory';

      const categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventName, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        const existingCategory = $filter('filter')($scope.categories, { id: data.payload.id }, true)[0];

        const index = $scope.categories.indexOf(existingCategory);
        if (index > -1) {
          $scope.categories.splice(index, 1);
        }

        toastr.success('Category Removed!', 'Category has been removed');
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

          // extend array
          angular.forEach($scope.categories, (value, key) => {
            if (value.parentId) {
              const existingCategory = $filter('filter')($scope.categories, { id: value.parentId }, true)[0];
              if (existingCategory != null && existingCategory != undefined) {
                value.parent = existingCategory;
              }
            }
          });
          /// ////////////////////////////////////////// *extend array

          // watch data in scope, if change reload table
          $scope.$watchCollection('categories', (newVal, oldVal) => {
            if (newVal !== oldVal) {
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
              name: 'asc', // initial sorting
            },
          }, {
            total: $scope.categories.length, // length of data
            getData($defer, params) {
            // use build-in angular filter
              let orderedData = params.sorting()
                ? $filter('orderBy')($scope.categories, params.orderBy())
                : $scope.categories;

              orderedData = $filter('filter')(orderedData, $scope.searchText);
              params.total(orderedData.length);

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            },
          });
        });
      /// /////////////////////////////////////// *Initialize table
    }])

  .controller('NewCategoryCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'categoryRepository', '$state', '$filter', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, categoryRepository, $state, $filter, toastr, _) {
      const eventName = 'categoryCreated';
      const commandName = 'createCategory';

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        toastr.success('Category Added!', 'Category has been created');
        $state.go('app.categories.list', {}, { reload: true });
      });

      // Submit operation
      $scope.ok = function () {
        if (!$scope.category.parentId) {
          $scope.category.parent = true;
        } else {
          $scope.category.parent = false;
        }

        CQRS.sendCommand({
          id: _.uniqueId('msg'),
          command: commandName,
          aggregate: {
            name: $scope.aggregate,
          },
          payload: $scope.category,
        });
      };
      /// //////////////////// *Submit operation

      const getCategoriesPromise = categoryRepository.query().$promise;
      getCategoriesPromise.then((result) => {
        $scope.categories = result.items;
      });
    }])

  .controller('EditCategoryCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'categoryRepository', '$state', '$stateParams', '$filter', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, categoryRepository, $state, $stateParams, $filter, toastr, _) {
      const categoryId = $stateParams.id;
      const eventName = 'categoryChanged';
      const commandName = 'changeCategory';

      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName,
      }, (items, data) => {
        toastr.success('Category Saved!', 'Category has been saved');
        $state.go('app.categories.list', {}, { reload: true });
      });

      // Submit operation
      $scope.ok = function () {
        if (!$scope.category.parentId) {
          $scope.category.parent = true;
        } else {
          $scope.category.parent = false;
        }

        CQRS.sendCommand({
          id: _.uniqueId('msg'),
          command: commandName,
          aggregate: {
            name: $scope.aggregate,
          },
          payload: $scope.category,
        });
      };
      /// //////////////////// *Submit operation

      const getCategoryPromise = categoryRepository.get({ id: categoryId }).$promise;
      getCategoryPromise
        .then((result) => {
          $scope.category = result;
          return categoryRepository.query().$promise;
        }, () => {
          $state.go('app.categories.list', {}, { reload: true });
        })
        .then((result) => {
          $scope.categories = result.items;
        });
    }])

  .controller('ShowCategoryCtrl', ['$scope', 'categoryRepository', '$state', '$stateParams',
    function ($scope, categoryRepository, $state, $stateParams) {
      const categoryId = $stateParams.id;

      const getCategoryPromise = categoryRepository.get({ id: categoryId }).$promise;
      getCategoryPromise
        .then((result) => {
          $scope.category = result;
          return categoryRepository.get({ id: $scope.category.parentId }).$promise;
        }, () => {
          $state.go('app.categories.list', {}, { reload: true });
        })
        .then((result) => {
          $scope.category.parent = result;
        });
    }]);
