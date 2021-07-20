app.controller('AuthCtrl', ['$scope', 'Auth', '$state', 'fbutil', 'FBURL', '$firebaseArray', 'toastr', function ($scope, Auth, $state, fbutil, FBURL, $firebaseArray, toastr) {
  // redirect if user is logged in
  if ($scope.loggedIn) {
    $state.go('app.overview', {}, { reload: true });
  }

  $scope.email = null;
  $scope.pass = null;
  $scope.confirm = null;
  $scope.createMode = false;
  $scope.rememberMe = true;

  $scope.login = function (email, pass, rememberMe) {
    $scope.err = null;
    Auth.$authWithPassword({ email, password: pass }, { rememberMe })
      .then((authData) => {
        console.log('Authenticated successfully with payload:', authData);
        $state.go('app.overview', {}, { reload: true });
      }, (err) => {
        $scope.err = errMessage(err);
        console.log('Login Failed!', err);
      });
  };

  $scope.register = function () {
    $scope.err = null;
    if (assertValidAccountProps()) {
      const { email } = $scope;
      const { pass } = $scope;
      // create user credentials in Firebase auth system
      Auth.$createUser({ email, password: pass })
        .then(() =>
          // authenticate so we have permission to write to Firebase
          Auth.$authWithPassword({ email, password: pass }))
        .then((user) => {
          // create a user profile in our data store
          const ref = fbutil.ref('users', user.uid);
          fbutil.handler((cb) => {
            ref.update({ email, role: 'user' }, cb);
          });
        })
        .then((/* user */) => {
          $state.go('app.overview', {}, { reload: true });
        }, (err) => {
          $scope.err = errMessage(err);
        });
    }
  };

  function assertValidAccountProps() {
    if (!$scope.email) {
      $scope.err = 'Please enter an email address';
    } else if (!$scope.pass || !$scope.confirm) {
      $scope.err = 'Please enter a password';
    } else if ($scope.createMode && $scope.pass !== $scope.confirm) {
      $scope.err = 'Passwords do not match';
    }
    return !$scope.err;
  }

  function errMessage(err) {
    return angular.isObject(err) && err.code ? err.code : `${err}`;
  }
}]);
