(function() {
  angular
    .module('app.run', [])
    .run(authentication);

  function authentication($rootScope, $state, $location) {};
})();
