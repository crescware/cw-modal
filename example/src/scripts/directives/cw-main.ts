/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';
import angular = require('angular');
import cw = require('../../app');

import d = require('../../../../lib/dialog');
import Dialog = d.Dialog;

export var directiveName = 'cwMain';

class Main {
  /**
   * @constructor
   */
  constructor() {
    // noop
  }

  /**
   * @returns {void}
   */
  openDialog1() {
    var dialog = new Dialog({
      template: '<cw-dialog-dummy></cw-dialog-dummy>',
      width: 600
    });
    dialog.onClose(() => {
      console.log('#openDialog1().onClose()');
    });
    dialog.open({
      key1: 'foofoo',
      key2: 'barbar'
    });
  }

  /**
   * @returns {void}
   */
  openAddVariableDialog1() {
    var dialog = new Dialog({
      template: '<cw-dialog-add-variable></cw-dialog-add-variable>',
      width: 500
    });
    dialog.onClose(() => {
      console.log('#openAddVariableDialog1().onClose()');
    });
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
