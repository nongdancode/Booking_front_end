(function(){
    const module = angular.module('module.booking.containers.booking-wizard', []);

    class BookingWizardComponent {
        constructor($scope, $state, $timeout, BookingService) {
            this.$scope = $scope;
            this.$state = $state;
            this.$timeout = $timeout;
            this.BookingService = BookingService;
        }

        $onInit() {
            this.loading = false;

            this.util = {
                keys: Object.keys,
                toInt: s => +s,
                toMoment: s => moment(+s),
            };

            this.step = 1;
            this.maxStep = 6;

            this.services = [];
            this.servicesMap = {};

            this.employees = [];
            this.employeesMap = {};

            this.availableTimes = {};
            this.bookingInfo = {};

            this.form = {
                info: {},
                confirm: {
                    term: false,
                    cookie: false
                },
                services: {},
                payment: {},
                address: {}
            };

            this.$scope.$watch('$ctrl.services', (newValue, oldValue) => {
                this.servicesMap = newValue.reduce((result, item) => {
                    return {
                        ...result,
                        [item.id]: item
                    };
                }, {});
            });

            this.$scope.$watch('$ctrl.employees', (newValue, oldValue) => {
                this.employeesMap = newValue.reduce((result, item) => {
                    return {
                        ...result,
                        [item.id]: item
                    };
                }, {});
            });

            window.addEventListener('resize', () => {
                let vh = window.innerHeight * 0.01;
                let vw = window.innerWidth * 0.01;

                console.log(vh, vw);

                document.documentElement.style.setProperty('--vh', `${vh}px`);
                document.documentElement.style.setProperty('--vw', `${vw}px`);
            });
        }

        setStep(step) {
            switch (step) {
            case 2: {
                this.loading = true;

                this.BookingService.findServices().then(services => {
                    this.services = services;
                    this.form.services = this.services.reduce((result, item) => {
                        return {
                            ...result,
                            [item.id]: {
                                active: false
                            }
                        };
                    }, {});

                    this.$timeout(() => {
                        this.loading = false;
                        this.step = step;
                    });
                });
                break;
            }

            case 3: {
                this.loading = true;

                this.BookingService.findEmployees().then(employees => {
                    this.employees = employees;

                    this.$timeout(() => {
                        this.loading = false;
                        this.step = step;
                    });
                });
                break;
            }

            case 4: {
                this.loading = true;

                const employeeIds = Object.values(this.form.services)
                      .filter(item => item.active)
                      .map(item => item.employeeId);

                employeeIds.forEach(id => {
                    this.availableTimes[id] = Object.keys(this.employeesMap[id].available)
                        .filter(timestamp => timestamp > moment().unix())
                        .reduce((result, timestamp) => {

                            const availableOptions = [];

                            this.employeesMap[id].available[timestamp].forEach(({start_time, end_time}) => {
                                const serviceStepping = this.servicesMap[this.employeesMap[id].service_id].stepping;

                                let start = moment.unix(start_time);
                                let end = moment.unix(end_time);

                                while (moment(start).add(serviceStepping, 'minutes') <= end) {
                                    let _start = moment(start);
                                    let _end = moment(start).add(serviceStepping, 'minutes');

                                    availableOptions.push({
                                        text: `${_start.format('hh:mm A')}`,
                                        value: {
                                            start: _start,
                                            end: _end
                                        }
                                    });

                                    start = moment(start).add(serviceStepping, 'minutes');
                                }
                            });

                            return {
                                ...result,
                                [moment.unix(timestamp).startOf('day').valueOf()]: availableOptions
                            };
                        }, {});

                    this.form.services[this.employeesMap[id].service_id].date = moment(+Object.keys(this.availableTimes[id])[0]);
                });

                this.loading = false;
                this.step = step;

                break;
            }
            default: {
                this.loading = false;
                this.step = step;
            }
            }
        };

        nextStep() {
            this.setStep(Math.min(this.step + 1, this.maxStep));
        };

        prevStep() {
            this.setStep(Math.max(this.step - 1, 1));
        };

        book() {
            this.loading = true;

            const data = {
                info: this.form.info,
                services: Object.keys(this.form.services)
                    .filter(serviceId => this.form.services[serviceId].active)
                    .map(serviceId => {
                        const service = this.form.services[serviceId];

                        return {
                            serviceId: serviceId,
                            employeeId: service.employeeId,
                            timeRange: {
                                start: service.time.start.valueOf(),
                                end: service.time.end.valueOf()
                            }
                        };
                    })
            };

            this.BookingService.confirm(data).then(res => {
                if (res.code === 0) {
                    this.bookingInfo = res.data;
                } else {
                    this.reset();

                    alert(res.error || 'Booking failed! Please retry');

                    return;
                }

                this.$timeout(() => {
                    this.loading = false;
                    this.nextStep();
                });
            });
        };

        charge() {
            this.loading = true;

            this.BookingService.charge({
                booking: {
                    info: this.form.info,
                    services: Object.keys(this.form.services)
                        .filter(serviceId => this.form.services[serviceId].active)
                        .map(serviceId => {
                            const service = this.form.services[serviceId];

                            return {
                                serviceId: serviceId,
                                employeeId: service.employeeId,
                                timeRange: {
                                    start: service.time.start.valueOf(),
                                    end: service.time.end.valueOf()
                                }
                            };
                        })
                },
                payment: {
                    ...this.form.payment,
                    ...this.form.address
                }
            }).then(res => {
                this.$timeout(() => {
                    this.loading = false;
                });

                if (res.code === 0) {
                    return;
                }

                this.reset();

                alert(res.error || 'Booking failed! Please retry');
            });
        };

        disableNext(form, step=this.step) {
            switch (step) {
            case 1: {
                return !(form.name.$valid && form.phone.$valid);
            }

            case 2: {
                return Object.values(this.form.services).every(item => !item.active);
            }

            case 3: {
                return Object.values(this.form.services).filter(item => item.active).some(item => !item.employeeId);
            }

            case 4: {
                return Object.values(this.form.services).filter(item => item.active).some(item => !item.time);
            }

            case 5: {
                return !(this.form.confirm.term && this.form.confirm.cookie);
            }

            case 6: {
                return !(form.cardNumber.$valid && form.cardName.$valid && form.cardExpiry.$valid && form.cardCVV.$valid);
            }

            default: {
                return false;
            }
            }
        };

        reset() {
            this.setStep(1);

            this.form = {
                info: {},
                confirm: {
                    term: false,
                    cookie: false
                },
                services: {},
                payment: {},
                address: {}
            };
        }
    }

    module.component('bookingWizard', {
        bindings: {
            '$resolve': '<'
        },
        controller: BookingWizardComponent,
        templateUrl: 'app/modules/booking/containers/booking-wizard/booking-wizard.component.html'
    });

    module.filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                out = items;
            }

            return out;
        };
    });
})();
