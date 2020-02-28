(function(){
  const module = angular.module('module.booking', [
    'module.booking.containers.booking-wizard',
    'module.booking.containers.check-in'
  ]);

  module.config(function ($stateProvider) {
    $stateProvider
      .state('booking-wizard', {
	      url: '/booking-wizard',
	      template: '<booking-wizard $resolve="$resolve"></booking-wizard>',
      })
      .state('check-in', {
	      url: '/check-in',
	      template: '<check-in $resolve="$resolve"></check-in>',
      })
      .state('term-of-service', {
	      url: '/term-of-service',
        templateUrl: 'app/modules/booking/containers/term-of-service/term-of-service.component.html'
      });
  });
})();
