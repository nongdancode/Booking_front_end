(function(){
    angular.module('module.booking-wizard.route', [
    ]).config(BookingWizardConfig);

    function BookingWizardConfig($stateProvider) {
        $stateProvider
            .state('booking-wizard', {
	        url: '/booking-wizard',
	        controller: 'BookingWizardController',
	        templateUrl: 'app/modules/booking-wizard/booking-wizard.html',
                cache: false
            });
    };
})();
