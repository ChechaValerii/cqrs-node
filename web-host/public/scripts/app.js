/* global app:true */
/* exported app */

const app = angular
  .module('emissApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'ui.router',
    'ui.bootstrap',
    'ngTable',
    'ui.utils',
    'toastr',
    'localytics.directives',
    'ngFileUpload',
    'slick',
    'angles',
    'ngCQRS',
    'btford.socket-io',
    'underscore',
  ]);

app.run(['$rootScope', 'StoreService', 'CQRS', 'socket', 'Auth', '$timeout', 'toastr',
  function ($rootScope, StoreService, CQRS, socket, Auth, $timeout, toastr) {
    const store = StoreService.createForController($rootScope);

    const handleLoadingEvents = function (isLoading) {
      $rootScope.loading = isLoading;
      if (isLoading) {
        $timeout(() => {
          if ($rootScope.loading) {
            $rootScope.loading = false;
            toastr.warning('Something might went wrong! Please retry!', 'Oops!');
          }
        }, 10000);
      }
    };
    // pass in events from your socket
    socket.on('events', (evt) => {
      handleLoadingEvents(false);
      const event = {
        aggregateType: evt.aggregate.name,
        name: evt.event,
        payload: evt.payload,
      };
      CQRS.eventReceived(event);
    });

    // pass commands to your socket
    CQRS.onCommand((data) => {
      handleLoadingEvents(true);
      socket.emit('commands', data);
    });

    // track status of authentication
    Auth.$onAuth((user) => {
      $rootScope.loggedIn = !!user;
    });
  }]);

app.factory('socket', (socketFactory) => socketFactory({
  ioSocket: io.connect('http://localhost:3000'),
}));

app.config((CQRSProvider) => {
  CQRSProvider.setUrlFactory((viewModelName, parameters) => '',
    // currently disabled, request collection manually
    // return 'http://localhost:3000/api/' + viewModelName + CQRSProvider.toUrlGETParameterString(parameters);
  );
});
