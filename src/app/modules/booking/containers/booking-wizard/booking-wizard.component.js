(function(){
    const module = angular.module('module.booking.containers.booking-wizard', []);

    class BookingWizardComponent {
        constructor($scope, $state, $timeout, BookingService, ModalService) {
            this.$scope = $scope;
            this.$state = $state;
            this.$timeout = $timeout;
            this.BookingService = BookingService;
            this.ModalService = ModalService;
        }

        $onInit() {
            this.window = window;

            this.loading = false;

            this.util = {
                keys: Object.keys,
                toInt: s => +s,
                toMoment: s => moment(+s),
            };

            this.step = 1;
            this.maxStep = 7;

            this.services = [];
            this.servicesMap = {};

            this.employees = [];
            this.employeesMap = {};

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

                document.documentElement.style.setProperty('--vh', `${vh}px`);
                document.documentElement.style.setProperty('--vw', `${vw}px`);
            });
        }

        setStep(step) {
            switch (step) {
            case 2: {
                this.loading = true;

                this.BookingService.findGroups().then(groups => {
                    this.groups = groups;

                    this.form.groups = this.groups.reduce((result, item) => {
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

                this.BookingService.findServices().then(services => {
                    const activedGroupIds = Object.keys(this.form.groups)
                          .filter(id => this.form.groups[id].active)
                          .map(id => +id);

                    this.services = services.filter(service => {
                        return activedGroupIds.some(id => service.groupIds.includes(id));
                    });

                    this.form.services = this.services.reduce((result, item) => {
                        return {
                            ...result,
                            [item.id]: {
                                id: item.id,
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

            case 4: {
                this.loading = true;

                this.BookingService.findEmployees().then(employees => {
                    this.employees = employees
                        .filter(employee => this.servicesMap[employee.service_id.toString()])
                        .reduce((result, employee) => {
                            if (!(employee.available || []).length) {
                                return result;
                            }

                            const stepping = this.servicesMap[employee.service_id].stepping;
                            const times = this.generateTimeRange(employee, stepping);

                            if (!Object.keys(times || {}).length) {
                                return result;
                            }

                            return [
                                ...result,
                                {...employee, times}
                            ];
                        }, []);

                    this.$timeout(() => {
                        this.loading = false;
                        this.step = step;
                    });
                });
                break;
            }
            case 5: {
                const employeeIds = Object.values(this.form.services)
                      .filter(item => item.active)
                      .map(item => item.employeeId);

                employeeIds.forEach(id => {
                    const serviceId = this.employeesMap[id].service_id;

                    const firstAvailable = (Object.keys(this.employeesMap[id].times) || [])[0];

                    this.form.services[serviceId].date = +firstAvailable;
                });

                this.step = step;
            }
            default: {
                this.loading = false;
                this.step = step;
            }
            }
        };

        generateTimeRange(employee, stepping) {
            return (employee.available || [])
                .filter(timestamp => timestamp.start < timestamp.end && timestamp.end > moment().unix())
                .reduce((result, timestamp) => {
                    const beginOfDay = moment.unix(timestamp.start).startOf('day').valueOf();

                    const availableOptions = result[beginOfDay] || [];

                    let start = moment.unix(timestamp.start);
                    let end = moment.unix(timestamp.end);

                    while (moment(start).add(stepping, 'minutes') <= end) {
                        let _start = moment(start);
                        let _end = moment(start).add(stepping, 'minutes');

                        availableOptions.push({
                            text: `${_start.tz(moment().tz()).format('hh:mm A')}`,
                            value: {
                                start: _start,
                                end: _end
                            }
                        });

                        start = moment(start).add(stepping, 'minutes');
                    }

                    return {
                        ...result,
                        [beginOfDay]: availableOptions
                    };
                }, {});
        }

        onDateChange(service) {}

        getEnabledDate(service) {
            const employeeId = this.form.services[service.id].employeeId;

            return Object.keys(this.employeesMap[employeeId].times).map(this.util.toMoment);
        }

        getAvailableTimes(service) {
            const employeeId = this.form.services[service.id].employeeId;
            const date = this.form.services[service.id].date.startOf('day').valueOf();

            return this.employeesMap[employeeId].times[date];
        }

        nextStep() {
            this.setStep(Math.min(this.step + 1, this.maxStep));
        };

        prevStep() {
            this.setStep(Math.max(this.step - 1, 1));
        };

        getBookingResult() {
            return {
                info: this.form.info,
                services: Object.keys(this.form.services)
                    .filter(serviceId => this.form.services[serviceId].active)
                    .map(serviceId => {
                        const service = this.form.services[serviceId];

                        return {
                            serviceId: serviceId,
                            employeeId: service.employeeId.split('_')[0],
                            timeRange: {
                                start: service.time.start.valueOf(),
                                end: service.time.end.valueOf()
                            }
                        };
                    })
            };
        }

        book() {
            this.loading = true;

            this.BookingService.confirm(this.getBookingResult())
                .then(res => {
                    this.bookingInfo = res.data;

                    this.$timeout(() => {
                        this.loading = false;
                        this.nextStep();
                    });
                }).catch(res => {
                    this.reset();

                    this.ModalService.error(res.error || 'Booking failed! Please retry');
                });
        };

        charge() {
            this.loading = true;

            this.BookingService.charge({
                booking: this.getBookingResult(),
                payment: {
                    ...this.form.payment,
                    ...this.form.address
                }
            }).then(res => {
                this.$timeout(() => {
                    this.loading = false;

                    this.ModalService.success('Booking successfully!');
                });
            }).catch(res => {
                this.reset();

                this.ModalService.error(res.error || 'Booking failed! Please retry');
            });
        };

        isOverlap(a, b) {
            return (a.start < b.start && a.end > b.start)
                || (a.start < b.end && a.end > b.end)
                || (a.start >= b.start && a.end <= b.end);
        }


        isCurrentServiceOverlap(id) {
            const { validateOverlap } = this.getOverlap();

            return validateOverlap.some(overlap => overlap.id === id);
        }

        getOverlap() {
            const activedServices = Object.values(this.form.services)
                  .filter(item => item.active);

            const validateTime = !activedServices
                  .every(item => item.time);

            const validateOverlap = activedServices
                  .filter(item => item.time)
                  .filter(item => activedServices
                          .filter(inner => inner.time && inner.id !== item.id)
                          .some(inner => this.isOverlap(item.time, inner.time)));

            return { validateTime, validateOverlap };
        }

        disableNext(form, step=this.step) {
            switch (step) {
            case 1: {
                return !(form.name.$valid && form.phone.$valid);
            }

            case 2: {
                return Object.values(this.form.groups).every(item => !item.active);
            }

            case 3: {
                return Object.values(this.form.services).every(item => !item.active);
            }

            case 4: {
                return Object.values(this.form.services).filter(item => item.active).some(item => !item.employeeId);
            }

            case 5: {
                const { validateTime, validateOverlap } = this.getOverlap();

                return validateTime || validateOverlap.length;
            }

            case 6: {
                return !(this.form.confirm.term && this.form.confirm.cookie);
            }

            case 7: {
                return !(form.cardNumber.$valid && form.cardName.$valid && form.cardExpiry.$valid && form.cardCVV.$valid);
            }

            default: {
                return false;
            }
            }
        };

        reset() {
            this.loading = false;
            this.$state.reload();
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
