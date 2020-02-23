(function() {
  angular.module('app.controller', [])
    .controller('AppController', AppController);

  function AppController($scope) {
    $scope.title = "Lash Client";
  };
})();
