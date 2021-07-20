/**
 * @ngdoc directive
 * @name emissApp.directive:slimScroll
 * @description
 * # slimScroll
 */
app
  .directive('slimscroll', () => ({
    restrict: 'A',
    link($scope, $el, $attr) {
      let option = {};
      const refresh = function () {
        if ($attr.slimscroll) {
          option = $scope.$eval($attr.slimscroll);
        } else if ($attr.slimscrollOption) {
          option = $scope.$eval($attr.slimscrollOption);
        }
        $el.slimscroll({ destroy: true });
        $el.slimscroll(option);
      };

      refresh();

      const collapseBtn = angular.element('.sidebar-collapse');
      const $window = angular.element(window);
      const sidebar = angular.element('#sidebar');

      const checkScrollbar = function () {
        refresh();
        if (!angular.element('#sidebar .slimScrollBar').is(':visible')) {
          sidebar.addClass('scroll-inactive');
        } else {
          sidebar.removeClass('scroll-inactive');
        }
      };

      collapseBtn.on('click', () => {
        checkScrollbar();
      });

      $window.resize(() => {
        checkScrollbar();
      });

      if ($attr.slimscroll && !option.noWatch) {
        $scope.$watchCollection($attr.slimscroll, refresh);
      }

      if ($attr.slimscrollWatch) {
        $scope.$watchCollection($attr.slimscrollWatch, refresh);
      }

      if ($attr.slimssrollListenTo) {
        $scope.on($attr.slimscrollListenTo, refresh);
      }
    },
  }));
