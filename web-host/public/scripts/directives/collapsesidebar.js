/**
 * @ngdoc directive
 * @name emissApp.directive:collapseSidebarSm
 * @description
 * # collapseSidebarSm
 */
app
  .directive('collapseSidebar', ($rootScope) => ({
    restrict: 'A',
    link: function postLink(scope, element) {
      const app = angular.element('.appWrapper');
      const $window = angular.element(window);
      let width = $window.width();

      const removeRipple = function () {
        angular.element('#sidebar').find('.ink').remove();
      };

      const collapse = function () {
        width = $window.width();

        if (width < 992) {
          app.addClass('sidebar-sm');
        } else {
          app.removeClass('sidebar-sm sidebar-xs');
        }

        if (width < 768) {
          app.removeClass('sidebar-sm').addClass('sidebar-xs');
        } else if (width > 992) {
          app.removeClass('sidebar-sm sidebar-xs');
        } else {
          app.removeClass('sidebar-xs').addClass('sidebar-sm');
        }

        if (app.hasClass('sidebar-sm-forced')) {
          app.addClass('sidebar-sm');
        }

        if (app.hasClass('sidebar-xs-forced')) {
          app.addClass('sidebar-xs');
        }
      };

      collapse();

      $window.resize(() => {
        if (width !== $window.width()) {
          let t;
          clearTimeout(t);
          t = setTimeout(collapse, 300);
          removeRipple();
        }
      });

      element.on('click', (e) => {
        if (app.hasClass('sidebar-sm')) {
          app.removeClass('sidebar-sm').addClass('sidebar-xs');
        } else if (app.hasClass('sidebar-xs')) {
          app.removeClass('sidebar-xs');
        } else {
          app.addClass('sidebar-sm');
        }

        app.removeClass('sidebar-sm-forced sidebar-xs-forced');
        app.parent().removeClass('sidebar-sm sidebar-xs');
        removeRipple();
        e.preventDefault();
      });
    },
  }));
