(function() {
    angular.module('service.booking', [])
        .factory('BookingService', BookingService);

    function BookingService(HttpService) {
        const services = {};

        services.findGroups = function() {
            return HttpService
                .get(window.config.baseApiUrl + 'booking/list_groups')
                .then(res => [
                    {
                        id: 1,
                        name: 'Lash'
                    },
                    {
                        id: 2,
                        name: 'Wax'
                    }
                ]);
        };

        services.findServices = function() {
            return HttpService
                .get(window.config.baseApiUrl + 'booking/list_services')
                .then(res => res.map((item, index) => {
                    return {
                        ...item,
                        groupIds: [(index % 2) + 1]
                    };
                }));
        };

        services.findEmployees = function() {
            return HttpService
                .get(window.config.baseApiUrl + 'booking/list_employee')
                .then(res => {
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
            return HttpService.post(window.config.baseApiUrl + 'booking/confirm', data);
        };

        services.charge = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'booking/charge', data);
        };

        services.checkin = function(data) {
            return HttpService.post(window.config.baseApiUrl + 'checkin/customer', data);
        };

        return services;
    }
})();
