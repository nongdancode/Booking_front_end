(function(){
    angular.module('module.booking-wizard.controller', [])
        .controller('BookingWizardController', BookingWizardController)
        .filter('propsFilter', function() {
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

    function BookingWizardController($scope, $timeout, BookingService) {
        $scope.loading = false;

        $scope.util = {
            keys: Object.keys,
            toInt: s => +s,
            toMoment: s => moment(+s),
        };

        $scope.step = 1;
        $scope.maxStep = 6;

        $scope.services = [];
        $scope.servicesMap = {};

        $scope.employees = [];
        $scope.employeesMap = {};

        $scope.$watch('services', function(newValue, oldValue) {
            $scope.servicesMap = newValue.reduce((result, item) => {
                return {
                    ...result,
                    [item.id]: item
                };
            }, {});
        });

        $scope.$watch('employees', function(newValue, oldValue) {
            $scope.employeesMap = newValue.reduce((result, item) => {
                return {
                    ...result,
                    [item.id]: item
                };
            }, {});
        });

        $scope.availableTimes = {};
        $scope.bookingInfo = {};

        $scope.form = {
            info: {},
            confirm: {
                term: false,
                cookie: false
            },
            services: {},
            payment: {},
            address: {}
        };

        $scope.setStep = function(step) {
            switch (step) {
            case 2: {
                $scope.loading = true;

                BookingService.findServices().then(services => {
                    $scope.services = services;
                    $scope.form.services = $scope.services.reduce((result, item) => {
                        return {
                            ...result,
                            [item.id]: {
                                active: false
                            }
                        };
                    }, {});

                    $timeout(() => {
                        $scope.loading = false;
                        $scope.step = step;
                    });
                });
                break;
            }

            case 3: {
                $scope.loading = true;

                BookingService.findEmployees().then(employees => {
                    $scope.employees = employees;

                    $timeout(() => {
                        $scope.loading = false;
                        $scope.step = step;
                    });
                });
                break;
            }

            case 4: {
                $scope.loading = true;

                const employeeIds = Object.values($scope.form.services)
                      .filter(item => item.active)
                      .map(item => item.employeeId);

                employeeIds.forEach(id => {
                    $scope.availableTimes[id] = Object.keys($scope.employeesMap[id].available).reduce((result, timestamp) => {
                        const availableOptions = [];

                        $scope.employeesMap[id].available[timestamp].forEach(({start_time, end_time}) => {
                            const serviceStepping = $scope.servicesMap[$scope.employeesMap[id].service_id].stepping;

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

                    $scope.form.services[$scope.employeesMap[id].service_id].date = moment(+Object.keys($scope.availableTimes[id])[0]);
                });

                $scope.loading = false;
                $scope.step = step;

                break;
            }
            default: {
                $scope.loading = false;
                $scope.step = step;
            }
            }
        };

        $scope.nextStep = function() {
            $scope.setStep(Math.min($scope.step + 1, $scope.maxStep));
        };

        $scope.prevStep = function() {
            $scope.setStep(Math.max($scope.step - 1, 1));
        };

        $scope.book = function() {
            $scope.loading = true;

            const data = {
                info: $scope.form.info,
                services: Object.keys($scope.form.services)
                    .filter(serviceId => $scope.form.services[serviceId].active)
                    .map(serviceId => {
                        const service = $scope.form.services[serviceId];

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

            BookingService.confirm(data).then(res => {
                $scope.bookingInfo = res;

                $timeout(() => {
                    $scope.loading = false;
                    $scope.nextStep();
                });
            });
        };

        $scope.charge = function() {
            $scope.loading = true;

            BookingService.charge({
                booking: {
                    info: $scope.form.info,
                    services: Object.keys($scope.form.services)
                        .filter(serviceId => $scope.form.services[serviceId].active)
                        .map(serviceId => {
                            const service = $scope.form.services[serviceId];

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
                    id: $scope.bookingInfo.id,
                    ...$scope.form.payment,
                    ...$scope.form.address
                }
            }).then(res => {
                $timeout(() => {
                    $scope.loading = false;
                });
            });
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
                return Object.values($scope.form.services).filter(item => item.active).some(item => !item.employeeId);
            }

            case 4: {
                return Object.values($scope.form.services).filter(item => item.active).some(item => !item.time);
            }

            case 5: {
                return !($scope.form.confirm.term && $scope.form.confirm.cookie);
            }

            case 6: {
                return !(form.cardNumber.$valid && form.cardName.$valid && form.cardExpiry.$valid && form.cardCVV.$valid);
            }

            default: {
                return false;
            }
            }
        };
    }
})();
