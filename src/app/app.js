angular.module('app.third-party', [
    'ngSanitize',
    'ui.router',
    'ui.select',
    'ui.mask',
    'ui-datetimepicker'
]);

angular.module('app.resources', []);

angular.module('app.services', [
    'service.booking',
    'service.utility'
]);

angular.module('app.directives', []);

angular.module('app.modules', [
    'module.booking-wizard',
    'module.check-in'
]);

angular.module('app', [
    'app.third-party',
    'app.resources',
    'app.services',
    'app.directives',
    'app.run',
    'app.modules',
    'app.config'
]);
