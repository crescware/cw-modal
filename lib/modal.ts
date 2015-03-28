/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../api/cw-modal.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/bluebird/bluebird.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="dialog.ts" />
'use strict';

import cw = require('cw-modal');
import angular = require('angular');
import jquery = require('jquery');
import Promise = require('bluebird');

interface ModalElement {
  element: JQuery;
  id: string;
  zIndex: number;
}

interface Scope extends ng.IScope {
  modalEnable: boolean;
}

export class Modal {
  static moduleName = 'cwModal';
  dialog: cw.DialogInstance<any>;

  /**
   * @constructor
   * @ngInject
   */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $element: ng.IAugmentedJQuery,
    private $compile: ng.ICompileService,
    private $scope: Scope,
    private $timeout: ng.ITimeoutService
  ) {
    this.init();
  }

  /**
   * @returns {void}
   */
  private init() {
    this.$scope.modalEnable = false;
    this.$rootScope.$on('cwModal.Dialog#open',  this.onOpen.bind(this));
    this.$rootScope.$on('cwModal.Dialog#close', this.onClose.bind(this));
  }

  /**
   * @param {ng.IAngularEvent} _ - event non-use
   * @param {cw.DialogInstance} dialog
   * @returns {void}
   */
  private onOpen(_: any, dialog: cw.DialogInstance<any>) {
    this.dialog = dialog;

    // Loading DOM
    this.$scope.modalEnable = true;
    var promise = new Promise((resolve) => {
      this.$timeout(() => resolve(void 0), 0);
    });

    // After load
    promise.then(() => {
      jquery('#cw-modal-display')
        .on('click', (event: JQueryEventObject) => {
          event.stopPropagation();
          this.dialog.close(event);
        });
      return this.dialog.template;

    }).then((template: string) => {
      jquery('#cw-modal-dialog-rect')
        .html('')
        .append(template)
        .on('click', (event: JQueryEventObject) => event.stopPropagation());
      this.$compile(jquery('#cw-modal-dialog-rect'))(this.$element.scope());

    }).catch((err: string) => {
      throw Error(err);
    });
  }

  /**
   * @param {ng.IAngularEvent} _ non-use
   * @param {JQueryEventObject} jQueryEvent
   * @param {cw.DialogInstance} dialog
   * @returns {void}
   */
  private onClose(_: ng.IAngularEvent, jQueryEvent: JQueryEventObject, dialog: cw.DialogInstance<any>) {
    // $timeout is required to apply changes of $scope.modalEnable
    this.$timeout(() => {
      jquery('#cw-modal-dialog-rect').html('');
      this.dialog = null;
      this.$scope.modalEnable = false;
      this.$rootScope.$broadcast(dialog.dialogUuid + '.onClose', jQueryEvent);
    }, 0);
  }
}

var HTML = `
<div ng-if="modalEnable">
  <div id="cw-modal-backdrop" style="z-index: 1040; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 0.5; background: rgb(51, 51, 51);"></div>
  <div id="cw-modal-display" style="z-index: 1050; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 1;">
    <div id="cw-modal-dialog-rect" class="modal-content" style="z-index: 1060; width: 600px; margin: 100px auto;"></div>
  </div>
</div>
`;

/**
 * @constructor
 */
function ddo() {
  return {
    controller: Modal,
    controllerAs: 'Modal',
    restrict: 'E',
    scope: {},
    template: HTML
  };
}

angular.module(Modal.moduleName, []);
angular.module(Modal.moduleName).directive(Modal.moduleName, ddo);