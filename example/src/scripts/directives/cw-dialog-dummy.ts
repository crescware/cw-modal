/**
 * cw-modal Sample App
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 10, 2015)
 */
'use strict';

import angular = require('angular');
import app = require('../../app');
import cwModal = require('cw-modal');

export var directiveName = 'cwDialogDummy';

interface DialogDummyControllerScope extends ng.IScope {
  dialog: cwModal.DialogInstance;
}

class DialogDummyController {
  /**
   * @constructor
   * @ngInject
   */
  constructor(
    private $scope: DialogDummyControllerScope
  ) {
    console.time('T');
  }

  close() {
    this.$scope.dialog.close();
  }
}

function DialogDummyDDO() {
  return {
    restrict: 'E',
    templateUrl: 'src/views/cw-dialog-dummy.html',
    require: '^cwModal',
    link: ($scope: DialogDummyControllerScope, _: any, __: any, cwModal: cwModal.ModalProperty) => {
      $scope.dialog = cwModal.dialog;
    },
    controller: DialogDummyController,
    controllerAs: 'DialogDummy',
    scope: {}
  }
}

angular.module(app.appName).directive(directiveName, DialogDummyDDO);
