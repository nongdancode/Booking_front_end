(function() {
    angular.module('service.booking', [])
        .factory('BookingService', BookingService);

    function BookingService(HttpService) {
        const services = {};

        services.findGroups = function() {
            return HttpService.get(window.config.baseApiUrl + 'booking/list_groups', {}, {
                errorHandleStrategy: HttpService.strategy.show
            });
        };

        services.findServices = function() {
            return HttpService.get(window.config.baseApiUrl + 'booking/list_services', {}, {
                errorHandleStrategy: HttpService.strategy.show
            });
        };

        services.findEmployees = function() {
            return HttpService.get(window.config.baseApiUrl + 'booking/list_employee', {}, {
                errorHandleStrategy: HttpService.strategy.show
            }).then(res => {
                return res.map(row => {
                    return {
                        ...row,
                        employee_id: row.id,
                        id: row.id + '_' + row.service_id
                    };
                });
            });
        };

        services.confirm = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'booking/confirm', data, {
                errorHandleStrategy: HttpService.strategy.rest
            });
        };

        services.charge = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'booking/charge', data, {
                errorHandleStrategy: HttpService.strategy.rest
            });
        };

        services.checkin = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'checkin/customer', data, {
                errorHandleStrategy: HttpService.strategy.rest
            });
        };

        return services;
    }
})();
