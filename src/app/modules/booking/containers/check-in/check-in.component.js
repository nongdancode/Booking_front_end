(function(){
    const module = angular.module('module.booking.containers.check-in', []);

    class CheckInComponent {
        constructor($scope, $sce, BookingService) {
            this.$scope = $scope;
            this.$sce = $sce;
            this.BookingService = BookingService;
        }

        $onInit() {
            this.musicUrl = this.$sce.trustAsResourceUrl('https://www.youtube.com/embed/J3KSI1FkvaY?autoplay=1&loop=1');

            this.form = {
                info: {
                    name: 'Fermentum',
                    phone: '0123456789'
                }
            };
        }

        done() {
            console.log(this.form);
        };
    }

    module.component('checkIn', {
        bindings: {
            '$resolve': '<'
        },
        controller: CheckInComponent,
        templateUrl: 'app/modules/booking/containers/check-in/check-in.component.html'
    });
})();
