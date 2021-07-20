app

  .controller('OrdersCtrl', ['$scope', 'StoreService', '$filter', 'user',
    function ($scope, StoreService, $filter, user) {
      $scope.aggregate = 'order';

      const store = StoreService.createForController($scope);
      store.for($scope.aggregate).do(() => {
      });

      $scope.user = user;
      $scope.order = {};
      $scope.settings = {
        globalVAT: 19,
      };
    }])

  .controller('OrdersListCtrl', ['$scope', 'CQRS', 'DenormalizationService', 'orderRepository', '$filter', 'ngTableParams', 'toastr', '_',
    function ($scope, CQRS, DenormalizationService, orderRepository, $filter, ngTableParams, toastr, _) {
      const eventNameDelete = 'orderDeleted';
      const commandNameDelete = 'deleteOrder';
      const eventNameUpdateStatus = 'orderStatusChanged';
      const commandNameUpdateStatus = 'changeStatusOrder';

      var categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventNameDelete, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventNameDelete,
      }, (items, data) => {
        const existingOrder = $filter('filter')($scope.orders, { id: data.payload.id }, true)[0];

        const index = $scope.orders.indexOf(existingOrder);
        if (index > -1) {
          $scope.orders.splice(index, 1);
        }

        toastr.success('Order Removed!', 'Order has been removed');
      });

      var categoryDeletedDenormalizationService = DenormalizationService.getDenormalizerFunctions(eventNameUpdateStatus, $scope.aggregate);
      DenormalizationService.registerDenormalizerFunction({
        viewModelName: $scope.aggregate,
        aggregateType: $scope.aggregate,
        eventName: eventNameUpdateStatus,
      }, (items, data) => {
        const existingOrder = $filter('filter')($scope.orders, { id: data.payload.id }, true)[0];

        if (existingOrder != null && existingOrder != undefined) {
          existingOrder.status = data.payload.status;
        }

        toastr.success('Order Updated!', 'Order has been updated');
      });

      // Delete CRUD operation
      $scope.delete = function (order) {
        if (confirm('Are you sure?')) {
          CQRS.sendCommand({
            id: _.uniqueId('msg'),
            command: commandNameDelete,
            aggregate: {
              name: $scope.aggregate,
            },
            payload: {
              id: order.id,
            },
          });
        }
      };
      /// ///////////////////////// *Delete CRUD operation

      $scope.changeStatus = function (order, status) {
        CQRS.sendCommand({
          id: _.uniqueId('msg'),
          command: commandNameUpdateStatus,
          aggregate: {
            name: $scope.aggregate,
          },
          payload: {
            id: order.id,
            status,
          },
        });
      };

      // Initialize table
      const getOrdersPromise = orderRepository.query().$promise;
      getOrdersPromise
        .then((result) => {
          $scope.orders = result.items;

          // watch data in scope, if change reload table
          $scope.$watchCollection('orders', (newVal, oldVal) => {
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
              id: 'asc', // initial sorting
            },
          }, {
            total: $scope.orders.length, // length of data
            getData($defer, params) {
              // use build-in angular filter
              let orderedData = params.sorting()
                ? $filter('orderBy')($scope.orders, params.orderBy())
                : $scope.orders;

              orderedData = $filter('filter')(orderedData, $scope.searchText);
              params.total(orderedData.length);

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            },
          });
        });
      /// /////////////////////////////////////// *Initialize table
    }])

  .controller('ShowOrderCtrl', ['$scope', 'orderRepository', 'productRepository', 'categoryRepository', '$state', '$stateParams', '$filter',
    function ($scope, orderRepository, productRepository, categoryRepository, $state, $stateParams, $filter) {
      const ordertId = $stateParams.id;

      const getOrderPromise = orderRepository.get({ id: ordertId }).$promise;
      getOrderPromise
        .then((result) => {
          $scope.order = result;
          return categoryRepository.query().$promise;
        }, () => {
          $state.go('app.orders.list', {}, { reload: true });
        })
        .then((result) => {
          $scope.categories = result.items;

          return productRepository.query().$promise;
        })
        .then((result) => {
          $scope.products = result.items;

          angular.forEach($scope.order.products, (value, key) => {
            value.extra = $filter('filter')($scope.products, { id: value.id }, true)[0];
            value.extra.category = $filter('filter')($scope.categories, { id: value.extra.categoryId }, true)[0];
          });
        });
    }])

  .controller('NewOrderCtrl', ['$scope', 'CQRS', '$state', '$stateParams', '_',
    function ($scope, CQRS, $state, $stateParams, _) {
      const { productId } = $stateParams;

      CQRS.sendCommand({
        id: _.uniqueId('msg'),
        command: 'createOrder',
        aggregate: {
          name: $scope.aggregate,
        },
        payload: {
          customer: {
            city: 'Bratislava',
            country: 'Slovakia',
            email: 'johny@douey.com',
            name: `Test Customer ${productId}`,
            phone: '+421946599455',
            street: 'Bratislavska 52',
            zip: '884 65',
          },
          delivery: 'Pick-up',
          payment: 'Cash',
          products: [
            {
              id: '575f150a4b068ec432e79936',
              amount: 3,
              price: 165.00,
            },
            {
              id: productId,
              amount: 1,
              price: 175.00,
            },
          ],
          shipTo: {
            city: 'Bratislava',
            country: 'Slovakia',
            name: 'John Douey',
            street: 'Bratislavska 52',
            zip: '884 65',
          },
          status: 'pending',
          subTotal: 670,
        },
      });

      $state.go('app.orders.list', {}, { reload: true });
    }]);
