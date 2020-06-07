(function(){
  angular
    .module('service.config', [])
    .factory('ConfigService', ConfigService);

  function ConfigService(HttpService) {
    const service = {};

    service.getConfig = function() {
      return HttpService.get(window.config.baseApiUrl + 'booking/configs', {}, {
        errorHandleStrategy: HttpService.strategy.show
      }).then(config => {

        return (Object.values(JSON.parse(config)) || []).reduce((result, section) => {
          return {
            ...result,
            ...Object.keys(section).reduce((result, key) => {
              return {
                ...result,
                [key]: section[key].value
              };
            }, {})
          };
        }, {});
      });
    };

    return service;
  }
})();
