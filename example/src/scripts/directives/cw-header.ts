/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');

export var directiveName = 'cwHeader';

function ddo() {
  return {
    restrict: 'E',
    templateUrl: 'src/views/cw-header.html'
  };
}

angular.module(cw.appName).directive(directiveName, ddo);
