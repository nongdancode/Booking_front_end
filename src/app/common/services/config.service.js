(function(){
  angular
    .module('service.config', [])
    .factory('ConfigService', ConfigService);

  function ConfigService(HttpService) {
    const service = {};

    service.getConfig = function() {
      return HttpService.get(window.config.baseApiUrl + 'booking/configs')
        .then(config => {
          return (config || []).reduce((result, item) => {
            return {
              ...result,
              [item.key]: item.value
            };
          }, {});
        });
    };

    return service;
  }
})();
