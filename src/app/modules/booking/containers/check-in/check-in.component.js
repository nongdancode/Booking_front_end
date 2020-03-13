(function(){
    const module = angular.module('module.booking.containers.check-in', []);

    class CheckInComponent {
        constructor($scope, $sce, $state, BookingService) {
            this.$scope = $scope;
            this.$sce = $sce;
            this.$state = $state;
            this.BookingService = BookingService;
        }

        $onInit() {
            this.musicUrl = this.$sce.trustAsResourceUrl('https://www.youtube.com/embed/J3KSI1FkvaY?autoplay=1&loop=1');

            this.form = {
                info: {
                    name: '',
                    phone: ''
                }
            };
        }

        done() {
            this.BookingService.checkin(this.form.info).then(res => {
                alert('Check-in successfully!');
            }).finally(() => this.$state.reload());
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
