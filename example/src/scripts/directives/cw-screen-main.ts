/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 7, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');

export var directiveName = 'cwScreenMain';

function ScreenMainDDO() {
  return {
    templateUrl: 'src/views/cw-screen-main.html'
  }
}

angular.module(cw.appName).directive(directiveName, ScreenMainDDO);
