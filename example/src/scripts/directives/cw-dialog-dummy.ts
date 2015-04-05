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

interface Scope extends ng.IScope {
  dialog: cwModal.DialogInstance<{key1: string; key2: string}>;
}

class Controller {
  /**
   * @constructor
   * @ngInject
   */
  constructor(
    private $scope: Scope
  ) {
    // noop
  }

  close() {
    this.$scope.dialog.close();
  }
}

declare var typeModal: cwModal.ModalProperty<{key1: string; key2: string}>;
function link($scope: Scope, _: any, __: any, cwModal: typeof typeModal) {
  $scope.dialog = cwModal.dialog;
  cwModal.dialog.onKeyDown((e: KeyboardEvent) => {
    console.log(e);
    if (e.keyCode === 13/* enter */) {
      cwModal.dialog.close();
    }
    if (e.keyCode === 27/* esc */) {
      cwModal.dialog.close();
    }
  });
}

function ddo() {
  return {
    controller: Controller,
    controllerAs: 'DialogDummy',
    link: link,
    require: '^cwModal',
    restrict: 'E',
    scope: {},
    templateUrl: 'src/views/cw-dialog-dummy.html'
  };
}

angular.module(app.appName).directive(directiveName, ddo);
