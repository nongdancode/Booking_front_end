(function() {
  angular
    .module('app.run', [])
    .run(config);

  function config($rootScope, ConfigService) {
    window.appConfig = {};

    ConfigService.getConfig()
      .then(config => {
        window.appConfig = config;
      });
  };
})();
