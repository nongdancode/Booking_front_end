(function(){
  const module = angular.module('module.booking.containers.check-in', []);

  class CheckInComponent {
    constructor($scope, $timeout, $sce, $state, BookingService) {
      this.$scope = $scope;
      this.$timeout = $timeout;
      this.$sce = $sce;
      this.$state = $state;
      this.BookingService = BookingService;
    }

    $onInit() {
      this.window = window;

      this.musicUrl = this.$sce.trustAsResourceUrl('https://www.youtube.com/embed/J3KSI1FkvaY?autoplay=1&loop=1');

      this.form = {
        info: {
          name: '',
          phone: '',
          birthday: ''
        }
      };

      this.step = 1;
    }

    checkin() {
      this.BookingService.checkin(this.form.info).then(res => {
        if (res && res[0].birthday) {
          alert('Check-in successfully!');

          this.$state.reload();
        } else {
          this.$timeout(() => {
            this.step += 1;
          });
        }
      });
    };

    done() {

      this.BookingService.checkin({
        ...this.form.info,
        birthday: +this.form.info.birthday.unix()
      }).then(res => {
        let message = 'Check-in successfully!';

        if (this.form.info.birthday.date() === moment().date() && this.form.info.birthday.month() === moment().month()) {
          message = 'Happy birthday! Check-in successfully!';
        }

        alert(message);

        this.$state.reload();
      });
    }
  }

  module.component('checkIn', {
    bindings: {
      '$resolve': '<'
    },
    controller: CheckInComponent,
    templateUrl: 'app/modules/booking/containers/check-in/check-in.component.html'
  });
})();
