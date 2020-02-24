(function() {
    angular.module('service.booking', [])
        .factory('BookingService', BookingService);

    function BookingService(HttpService) {
        const services = {};

        services.findServices = function() {
            return HttpService
                .get(window.config.baseApiUrl + 'list_services')
                .catch(err => [
                    {
                        id: 1,
                        img: 'assets/images/item-1.jpg',
                        name: 'Non diam phasellus vestibulum?',
                        stepping: 30
                    },
                    {
                        id: 2,
                        img: 'assets/images/item-2.jpg',
                        name: 'Fermentum dui faucibus in!',
                        stepping: 15
                    },
                    {
                        id: 3,
                        img: 'assets/images/item-1.jpg',
                        name: 'Convallis aenean et tortor?',
                        stepping: 10
                    },
                    {
                        id: 4,
                        img: 'assets/images/item-2.jpg',
                        name: 'Tellus cras adipiscing enim?',
                        stepping: 20
                    }
                ]);
        };

        services.findEmployees = function() {
            return HttpService
                .get(window.config.baseApiUrl + 'list_employee')
                .catch(err => [
                    {
                        id: 1,
                        name: 'Adam',
                        img: 'assets/images/item-1.jpg',
                        service_id: 1,
                        available: {
                            [moment(new Date()).valueOf()]: [
                                {
                                    start: moment(new Date()).valueOf(),
                                    end: moment(new Date()).add(6, 'hours').valueOf()
                                }
                            ]
                        }
                    },
                    {
                        id: 2,
                        name: 'Amalie',
                        img: 'assets/images/item-2.jpg',
                        service_id: 2,
                        available: {
                            [moment(new Date()).valueOf()]: [
                                {
                                    start: moment(new Date()).valueOf(),
                                    end: moment(new Date()).add(6, 'hours').valueOf()
                                }
                            ]
                        }
                    },
                    {
                        id: 3,
                        name: 'Estefanía',
                        img: 'assets/images/item-1.jpg',
                        service_id: 1,
                        available: {
                            [moment(new Date()).valueOf()]: [
                                {
                                    start: moment(new Date()).valueOf(),
                                    end: moment(new Date()).add(6, 'hours').valueOf()
                                }
                            ]
                        }
                    },
                    {
                        id: 4,
                        name: 'Adrian',
                        img: 'assets/images/item-2.jpg',
                        service_id: 3,
                        available: {
                            [moment(new Date()).valueOf()]: [
                                {
                                    start: moment(new Date()).valueOf(),
                                    end: moment(new Date()).add(6, 'hours').valueOf()
                                }
                            ]
                        }
                    },
                    {
                        id: 5,
                        name: 'Wladimir',
                        img: 'assets/images/item-1.jpg',
                        service_id: 4,
                        available: {
                            [moment(new Date()).valueOf()]: [
                                {
                                    start: moment(new Date()).valueOf(),
                                    end: moment(new Date()).add(6, 'hours').valueOf()
                                }
                            ]
                        }
                    }
                ]);
        };

        services.confirm = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'confirm', data)
                .then(res => res.data);
        };

        services.charge = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'charge', data)
                .then(res => res.data);
        };

        return services;
    }
})();
