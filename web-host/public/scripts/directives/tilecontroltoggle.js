app
  .directive('tileControlToggle', () => ({
    restrict: 'A',
    link: function postLink(scope, element) {
      const tile = element.parents('.tile');

      element.on('click', () => {
        tile.toggleClass('collapsed');
        tile.children().not('.tile-header').slideToggle(150);
      });
    },
  }));
