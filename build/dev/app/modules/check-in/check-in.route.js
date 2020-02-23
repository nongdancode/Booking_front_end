(function(){
    angular.module('module.check-in.route', [
    ]).config(CheckInConfig);

    function CheckInConfig($stateProvider) {
        $stateProvider
            .state('check-in', {
	        url: '/check-in',
	        controller: 'CheckInController',
	        templateUrl: 'app/modules/check-in/check-in.html',
                cache: false
            });
    };
})();
