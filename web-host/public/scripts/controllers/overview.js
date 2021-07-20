app
  .controller('OverviewCtrl', ['$scope', '$state', 'categoryRepository', 'productRepository', 'orderRepository', '$firebaseArray', 'FBURL', '$filter', 'uploadImage', 'user', 'toastr',
    function ($scope, $state, categoryRepository, productRepository, orderRepository, $firebaseArray, FBURL, $filter, uploadImage, user, toastr) {
      $scope.page = {
        title: 'Overview',
      };
      const getCategoriesPromise = categoryRepository.query().$promise;
      getCategoriesPromise
        .then((result) => {
          $scope.categories = result.items;
        });

      const getProductsPromise = productRepository.query().$promise;
      getProductsPromise
        .then((result) => {
          $scope.products = result.items;
        });

      const getOrdersPromise = orderRepository.query().$promise;
      getOrdersPromise
        .then((result) => {
          $scope.orders = result.items;

          $scope.ordersValue = 0;
          angular.forEach($scope.orders, (val, key) => {
            $scope.ordersValue += val.subTotal;
          });
        });

      // General Firebase variable
      const ref = new Firebase(FBURL);
      $scope.users = $firebaseArray(ref.child('users'));
      $scope.users.$loaded(() => {
        $scope.activeUsers = $filter('filter')($scope.users, { blocked: false });
      });
    }])

  .controller('OrdersChartCtrl', ['$scope', 'orderRepository', '$filter', '_',
    function ($scope, orderRepository, $filter, _) {
      $scope.range = '7d';

      $scope.options = {
        scaleShowVerticalLines: false,
        barValueSpacing: 20,
      };

      function fetchOrders() {
        const getOrdersPromise = orderRepository.query().$promise;
        getOrdersPromise
          .then((result) => {
            $scope.orders = $filter('orderBy')(result.items, 'createdAt');

            const lastOrder = _.last($scope.orders);
            if (lastOrder) {
              let lastDate = moment(lastOrder.createdAt).startOf('day').format('x');
              let x;
              const dayDuration = 86400000;

              $scope.chart = {
                labels: [],
                datasets: [
                  {
                    fillColor: '#f1c40f',
                    strokeColor: 'rgba(0,0,0,0)',
                    data: [],
                  },
                ],
              };
              $scope.options.tooltipTemplate = '<%if (label){%><%=label%>: <%}%> $<%= value %>';

              if ($scope.range === '7d') {
                x = 7;
                lastDate -= 6 * dayDuration;
              } else if ($scope.range === '31d') {
                x = 31;
                lastDate -= 30 * dayDuration;
              }

              for (let i = 0; i < x; i++) {
                $scope.chart.labels.push($filter('date')(lastDate, 'dd MMM'));
                lastDate += dayDuration;
              }

              angular.forEach($scope.chart.labels, (date) => {
                let dayValue = 0;
                angular.forEach($scope.orders, (order) => {
                  const orderDate = $filter('date')(order.createdAt, 'dd MMM');
                  if (orderDate === date) {
                    dayValue += order.subTotal;
                  }
                });
                $scope.chart.datasets[0].data.push(dayValue);
              });
            }
          });
      }

      fetchOrders();

      $scope.$watch('range', (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (newVal === '7d') {
            $scope.options.barValueSpacing = 20;
          }

          if (newVal === '31d') {
            $scope.options.barValueSpacing = 5;
          }

          fetchOrders();
        }
      });
    },
  ])

  .controller('ProductsChartCtrl', ['$scope', 'categoryRepository', 'productRepository', '$filter',
    function ($scope, categoryRepository, productRepository, $filter) {
      $scope.chart = [];

      const generateColor = function () {
        const r = (Math.round(Math.random() * 127) + 127).toString(16);
        const g = (Math.round(Math.random() * 127) + 127).toString(16);
        const b = (Math.round(Math.random() * 127) + 127).toString(16);
        return `#${r}${g}${b}`;
      };

      function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length == 1) ? `0${R.toString(16)}` : R.toString(16));
        const GG = ((G.toString(16).length == 1) ? `0${G.toString(16)}` : G.toString(16));
        const BB = ((B.toString(16).length == 1) ? `0${B.toString(16)}` : B.toString(16));

        return `#${RR}${GG}${BB}`;
      }

      const getCategoriesPromise = categoryRepository.query().$promise;
      getCategoriesPromise
        .then((result) => {
          $scope.categories = result.items;

          return productRepository.query().$promise;
        })
        .then((result) => {
          $scope.products = result.items;

          const parentCategories = $filter('filter')($scope.categories, { parent: true });
          const childCategories = $filter('filter')($scope.categories, { parent: false });

          angular.forEach(parentCategories, (val, key) => {
            let quantity = 0;

            angular.forEach(childCategories, (category) => {
              let x = 0;
              angular.forEach($scope.products, (product) => {
                if (product.categoryId === category.id) {
                  x++;
                }
              });
              if (category.parentId === val.id && x > 0) {
                quantity++;
              }
            });

            $scope.chart[key] = {};
            $scope.chart[key].color = generateColor();
            $scope.chart[key].highlight = shadeColor($scope.chart[key].color, -15);
            $scope.chart[key].label = val.name;
            $scope.chart[key].value = quantity;
          });
        });
    }]);
