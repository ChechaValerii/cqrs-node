app
  .directive('tileControlFullscreen', () => ({
    restrict: 'A',
    link: function postLink(scope, element) {
      const dropdown = element.parents('.dropdown');

      element.on('click', () => {
        dropdown.trigger('click');
      });
    },
  }));
