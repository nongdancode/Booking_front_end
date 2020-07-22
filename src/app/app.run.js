(function() {
  angular
    .module('app.run', [])
    .run(config);

  function config($rootScope, ConfigService) {
    window.appConfig = {};

    ConfigService.getConfig()
                 .then(config => {
                   $rootScope.$apply(() => {
                     window.appConfig = config;

                     if (!config['client']['enable-client']) {
                       const text = config['client']['disable-client-text'] || 'We are temporary closed , sorry and see you soon';
                       document.body.innerHTML = `<div class="alert alert-warning center-block" style="width: 80%;">${text}</div>`;
                     }

                     moment.tz.setDefault(config['client']['timezone'] || 'America/Chicago');
                   })
                 });
  };
})();
