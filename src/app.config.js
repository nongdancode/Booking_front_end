(function() {
  angular
    .module('app.config', [])
    .config(function($urlRouterProvider) {
      $urlRouterProvider.otherwise('/booking-wizard');
    })
  ;
})();
