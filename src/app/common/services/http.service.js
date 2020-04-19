(function() {
  const module = angular.module('service.http', []);

  module.factory('HttpInterceptor', function(){
    var service = {};

    service.request = function(config) {
      return config;
    };

    service.responseError = function(response) {
      return response;
    };

    return service;
  });

  module.config(function($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptor');
  });

  module.factory('HttpService', HttpService);

  function HttpService($http, HttpStrategyService) {
    var service = {
      strategy: HttpStrategyService
    };

    service.generateUrl = function(endpoint) {
      return window.config.baseApiUrl + endpoint;
    };

    service.get = function(url, params, options={}) {
      const errorHandleStrategy = options.errorHandleStrategy || service.strategy.rest;

      return errorHandleStrategy(
        $http.get(url, params)
      );
    };

    service.post = function(url, body, options={}) {
      const errorHandleStrategy = options.errorHandleStrategy || service.strategy.rest;

      return errorHandleStrategy(
        $http.post(url, body, options)
      );
    };

    service.put = function(url, body, options={}) {
      const errorHandleStrategy = options.errorHandleStrategy || service.strategy.rest;

      return errorHandleStrategy(
        $http.put(url, body)
      );
    };

    service.delete = function(url, params, options={}) {
      const errorHandleStrategy = options.errorHandleStrategy || service.strategy.rest;

      return errorHandleStrategy(
        $http.delete(url, params)
      );
    };

    service.upload = function(url, field) {
      return function(file) {
        const fd = new FormData();
        fd.append(field, file);

        return service.post(url, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        });
      };
    };

    return service;
  }

  module.factory('HttpStrategyService', HttpStrategyService);

  function HttpStrategyService(ModalService) {
    var service = {};

    service.default = function(request) {
      return request.then(response => response.data);
    };

    service.rest = function(request) {
      return new Promise((resolve, reject) => {
        request
          .then(response => response.data)
          .then(response => {
            if (response.code) {
              return reject(response);
            }

            return resolve(response.data);
          }).catch(reject);
      });
    };

    service.show = function(request) {
      const message = 'Maintainence in progress.';

      return new Promise((resolve, reject) => {
        request
          .then(response => response.data)
          .then(response => {
            if (response.code) {
              const error = response.error || message;
              return ModalService.error(error);
            }

            return resolve(response.data);
          }).catch(reject);
      });
    };

    return service;
  }
})();
