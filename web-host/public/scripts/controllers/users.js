app

  .controller('UsersCtrl', ['$scope', '$state', '$stateParams', '$firebaseArray', '$firebaseObject', 'FBURL', 'currentUser',
    function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject, FBURL, currentUser) {
      // General database variable
      const ref = new Firebase(FBURL);
      $scope.users = $firebaseArray(ref.child('users'));
      $scope.userObject = $firebaseObject(ref.child('users'));
      $scope.blockedUsers = ref.child('blockedUsers');
      /// ///////////////////////// *General database variable

      // get the model
      if ($stateParams.id) {
        const { id } = $stateParams;
        $scope.user = $firebaseObject(ref.child('users').child(id));
      } else {
        $scope.user = {
          changeEmail: true,
          changePass: true,
        };
      }

      if (currentUser.role === 'admin') {
        $scope.roles = {
          admin: 'admin',
          superuser: 'superuser',
          user: 'user',
        };
      } else {
        $scope.roles = {
          superuser: 'superuser',
          user: 'user',
        };
      }
    }])

  .controller('UsersListCtrl', ['$scope', '$filter', 'ngTableParams', 'toastr', 'FBURL',
    function ($scope, $filter, ngTableParams, toastr, FBURL) {
      const ref = new Firebase(FBURL);

      // Delete CRUD operation
      $scope.delete = function (user) {
        if (confirm('Are you sure?')) {
          $scope.users.$ref().child(user.$id).child('blocked').set(true);
          $scope.blockedUsers.child(user.$id).set({ blocked: true });
          $scope.tableParams.reload();

          toastr.success('User Removed!', 'User has been removed');
        }
      };
      /// ///////////////////////// *Delete CRUD operation

      // password reset operation
      $scope.passReset = function (user) {
        if (confirm('Are you sure?')) {
          ref.resetPassword({
            email: user.email,
          }, (error) => {
            if (error === null) {
              console.log('Password reset email sent successfully');
            } else {
              console.log('Error sending password reset email:', error);
            }
          });
        }
      };
      /// ///////////////////////// *password reset operation

      /// ///////////////////////////////////////
      //* *********** Table Settings **********//
      /// ///////////////////////////////////////

      // Initialize table
      $scope.users.$loaded().then(() => {
        // watch data in scope, if change reload table
        $scope.$watchCollection('users', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            $scope.tableParams.reload();
          }
        });

        $scope.$watch('searchText', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            $scope.tableParams.reload();
          }
        });
        /// ////////////////////////////////////////// *watch data in scope, if change reload table

        $scope.tableParams = new ngTableParams({
          page: 1, // show first page
          count: 10, // count per page
          sorting: {
            name: 'asc', // initial sorting
          },
        }, {
          total: $scope.users.length, // length of data
          getData($defer, params) {
            // use build-in angular filter
            let orderedData = params.sorting()
              ? $filter('orderBy')($scope.users, params.orderBy())
              : $scope.users;

            orderedData	= $filter('filter')(orderedData, { blocked: false });
            orderedData	= $filter('filter')(orderedData, $scope.searchText);
            params.total(orderedData.length);

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          },
        });
      });
      /// /////////////////////////////////////// *Initialize table
    }])

  .controller('NewUserCtrl', ['$scope', 'toastr', '$state', 'FBURL', '$filter', 'Auth',
    function ($scope, toastr, $state, FBURL, $filter, Auth) {
      const ref = new Firebase(FBURL);
      const profiles = ref.child('users');

      $scope.editing = false;

      // Submit operation
      $scope.ok = function () {
        $scope.userEntry = {
          name: $scope.user.name,
          email: $scope.user.email,
          role: $scope.user.role,
          phone: $scope.user.phone,
          blocked: false,
        };

        if ($scope.user.address) {
          $scope.user.address = {
            street: $scope.user.address.street,
            city: $scope.user.address.city,
            zip: $scope.user.address.zip,
            country: $scope.user.address.country,
          };
        }

        Auth.$createUser({ email: $scope.user.email, password: $scope.user.password })
          .then((userData) => {
            // create a user profile in our data store
            profiles.child(userData.uid).set($scope.userEntry);

            console.log('Successfully created user account with uid:', userData.uid);
            toastr.success('User has been created', 'User Added!');
            $state.go('app.users.list', {}, { reload: true });
          }, (error) => {
            console.log('Error creating user:', error);
            toastr.error(error.message, 'Adding User Error!');
          });
      };
      /// //////////////////// *Submit operation
    }])

  .controller('EditUserCtrl', ['$scope', '$firebaseObject', 'toastr', '$state', 'FBURL', '$filter',
    function ($scope, $firebaseObject, toastr, $state, FBURL, $filter) {
      $scope.editing = true;

      const ref = new Firebase(FBURL);
      const profiles = ref.child('users');

      $scope.user.$loaded().then(() => {
        $scope.oldEmail = angular.copy($scope.user.email);
      });

      $scope.users.$loaded(() => {
        // Submit operation
        $scope.ok = function () {
          $scope.userEntry = {
            name: $scope.user.name,
            email: $scope.user.email,
            role: $scope.user.role,
            phone: $scope.user.phone,
          };

          if ($scope.user.address) {
            $scope.user.address = {
              street: $scope.user.address.street,
              city: $scope.user.address.city,
              zip: $scope.user.address.zip,
              country: $scope.user.address.country,
            };
          }

          $scope.credentials = {
            password: $scope.user.password,
            oldpassword: $scope.user.oldpassword,
          };

          const updateOnSuccess = function () {
            profiles.child($scope.user.$id).update($scope.userEntry, () => {
              toastr.success('User has been saved', 'User Saved!');
              $state.go('app.users.list', {}, { reload: true });
            });
          };

          const { changeEmail } = $scope.user;
          const { changePass } = $scope.user;

          if (changeEmail === true) {
            ref.changeEmail({
              oldEmail: $scope.oldEmail,
              newEmail: $scope.user.email,
              password: $scope.credentials.password,
            }, (error) => {
              if (error === null) {
                console.log('Email changed successfully');
                toastr.success('Email has been changed successfully', 'Email changed!');
                updateOnSuccess();
              } else {
                toastr.error(error.message, 'Email change error!');
                console.log('Error changing email:', error);
              }
            });
          } else if (changePass === true) {
            ref.changePassword({
              email: $scope.user.email,
              oldPassword: $scope.credentials.oldpassword,
              newPassword: $scope.credentials.password,
            }, (error) => {
              if (error === null) {
                console.log('Password changed successfully');
                toastr.success('Password has been changed successfully', 'Password changed!');
                updateOnSuccess();
              } else {
                toastr.error(error.message, 'Password change error!');
                console.log('Error changing password:', error);
              }
            });
          } else {
            updateOnSuccess();
          }
        };
        /// //////////////////// *Submit operation
      });
    }])

  .controller('ShowUserCtrl', ['$scope', '$firebaseObject', 'toastr', '$state', 'FBURL', '$stateParams',
    function ($scope, $firebaseObject, toastr, $state, FBURL, $stateParams) {

    }]);
