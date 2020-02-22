(function(){
    angular.module('module.check-in.controller', [])
        .controller('CheckInController', CheckInController);

    function CheckInController($scope, $timeout, BookingService) {
        $scope.form = {
            info: {
                name: 'Fermentum',
                phone: '0123456789'
            }
        };

        $scope.done = function() {
            console.log($scope.form);
        };

        $scope.disableNext = function(form, step=$scope.step) {
            switch (step) {
            case 1: {
                return !(form.name.$valid && form.phone.$valid);
            }

            case 2: {
                return Object.values($scope.form.services).every(item => !item.active);
            }

            case 3: {
                return false;
            }

            case 4: {
                return false;
            }

            case 5: {
                return !($scope.form.confirm.term && $scope.form.confirm.cookie);
            }

            default: {
                return false;
            }
            }
        };
    }
})();
