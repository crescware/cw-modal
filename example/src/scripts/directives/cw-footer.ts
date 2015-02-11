/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 11, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');

export var directiveName = 'cwFooter';

function FooterDDO() {
  return {
    restrict: 'E',
    templateUrl: 'src/views/cw-footer.html'
  }
}

angular.module(cw.appName).directive(directiveName, FooterDDO);
