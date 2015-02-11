/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');
import cwm = require('../../../../lib/cw-modal');
import Dialog = cwm.cwModal.Dialog;

export var directiveName = 'cwMain';

class Main {
  /**
   * @constructor
   */
  constructor() {
    //
  }

  /**
   * @returns {void}
   */
  openDialog1() {
    var dialog = new Dialog({
      template: '<cw-dialog-dummy></cw-dialog-dummy>'
    });
    dialog.open();
  }

  /**
   * @returns {void}
   */
  openDialog2() {
    var dialog = new Dialog('<cw-dialog-add-variable></cw-dialog-add-variable>');
    dialog.open();
  }
}

function MainDDO() {
  return {
    restrict: 'E',
    templateUrl: 'src/views/cw-main.html',
    controller: Main,
    controllerAs: 'Main'
  }
}

angular.module(cw.appName).directive(directiveName, MainDDO);
