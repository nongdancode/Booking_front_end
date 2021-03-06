angular.module('app.third-party', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ui.select',
    'ui.mask',
    'ui-datetimepicker'
]);

try {
    angular.module("app.templates");
} catch (e) {
    angular.module("app.templates", []);
}

angular.module('app.resources', []);

angular.module('app.services', [
    'service.http',
    'service.config',
    'service.modal',
    'service.booking',
    'service.utility'
]);

angular.module('app.directives', []);

angular.module('app.modules', [
    'module.booking'
]);

angular.module('app', [
    'app.templates',
    'app.third-party',
    // 'app.mock',
    'app.resources',
    'app.services',
    'app.directives',
    'app.run',
    'app.modules',
    'app.config'
]);
