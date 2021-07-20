app
  .directive('tileControlClose', () => ({
    restrict: 'A',
    link: function postLink(scope, element) {
      const tile = element.parents('.tile');

      element.on('click', () => {
        tile.addClass('closed').fadeOut();
      });
    },
  }));
