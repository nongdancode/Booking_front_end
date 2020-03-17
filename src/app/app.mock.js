(function() {
  const module = angular.module('app.mock', []);

  module.factory('HttpMockInterceptor', function() {
    var service = {};

    service.response = function(response) {
      const api = response.config.url
            .replace(window.config.baseUrl, '')
            .split('?')[0];

      switch (true) {
      }

      return response;
    };

    return service;
  });

  module.config(function($httpProvider) {
    $httpProvider.interceptors.push('HttpMockInterceptor');
  });
})();
