/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 7, 2015)
 */
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
'use strict';

// Loading angular for global variable.
// Cannot write as var angular = require('angular');
// because of overwrite a global variable.
require('angular');
require('angular-route');

export var appName = 'cwModalExample';
export var externalModule = ['ngRoute'];
angular.module(appName, externalModule);

function RouteConfig(
  $routeProvider: ng.route.IRouteProvider,
  $locationProvider: ng.ILocationProvider
) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/', {templateUrl: 'src/views/main.html'})
    .otherwise({redirectTo: '/'});
}
RouteConfig.$inject = ['$routeProvider', '$locationProvider'];

angular.module(appName).config(RouteConfig);

