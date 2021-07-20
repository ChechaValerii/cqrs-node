/**
 * A directive that shows elements only when user is logged in.
 */
app.directive('ngShowAuth', ['Auth', '$timeout', function (Auth, $timeout) {
  let isLoggedIn;
  Auth.watch((user) => {
    isLoggedIn = !!user;
  });

  return {
    restrict: 'A',
    link(scope, el) {
      el.addClass('ng-cloak'); // hide until we process it

      function update() {
        // sometimes if ngCloak exists on same element, they argue, so make sure that
        // this one always runs last for reliability
        $timeout(() => {
          el.toggleClass('ng-cloak', !isLoggedIn);
        }, 0);
      }

      update();
      Auth.watch(update, scope);
    },
  };
}]);
