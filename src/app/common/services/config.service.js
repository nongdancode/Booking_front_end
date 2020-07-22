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
        config = JSON.parse(config);

        return (Object.keys(config) || []).reduce((result, key) => {
          const section = config[key];

          return {
            ...result,
            [key]: Object.keys(section).reduce((result, key) => {
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
