app
  .controller('NavCtrl', ($scope) => {
    $scope.oneAtATime = false;

    $scope.status = {
      isFirstOpen: true,
      isSecondOpen: true,
      isThirdOpen: true,
    };
  });
