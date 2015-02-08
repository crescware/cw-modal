/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');

export var directiveName = 'cwMain';

function MainDDO() {
  return {
    templateUrl: 'src/views/cw-main.html'
  }
}

angular.module(cw.appName).directive(directiveName, MainDDO);
