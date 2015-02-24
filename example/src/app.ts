/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 7, 2015)
 */
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../api/cw-modal.d.ts" />
'use strict';

var angular = require('angular');
require('angular-route');
require('../../lib/modal');

export var appName = 'cwModalExample';
export var externalModule = ['ngRoute', 'cwModal'];
angular.module(appName, externalModule);

/**
 * @constructor
 */
function RouteConfig(
  $routeProvider: ng.route.IRouteProvider,
  $locationProvider: ng.ILocationProvider
) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/', {template: '<cw-screen-main></cw-screen-main>'})
    .otherwise({redirectTo: '/'});
}
RouteConfig.$inject = ['$routeProvider', '$locationProvider'];

angular.module(appName).config(RouteConfig);

