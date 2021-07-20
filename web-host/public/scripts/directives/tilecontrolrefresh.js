app
  .directive('tileControlRefresh', () => ({
    restrict: 'A',
    link: function postLink(scope, element) {
      const tile = element.parents('.tile');
      const dropdown = element.parents('.dropdown');

      element.on('click', () => {
        tile.addClass('refreshing');
        dropdown.trigger('click');
      });
    },
  }));
