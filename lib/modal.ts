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

import angular = require('angular');
import cw      = require('cw-modal');
import events  = require('events');
import Promise = require('bluebird');

import EventEmitter = events.EventEmitter;
export var emitter = new EventEmitter();

interface ModalElement {
  element: JQuery;
  id: string;
  zIndex: number;
}

interface Scope extends ng.IScope {
  modalEnable: boolean;
}

var ID_DRAWING_PART = 'cw-modal-dialog-rect';
var MODULE_NAME = 'cwModal';

export class Modal {
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
    emitter.on('Dialog#open',  this.onOpen.bind(this));
    emitter.on('Dialog#close', this.onClose.bind(this));
  }

  /**
   * @param {cw.DialogInstance} dialog
   * @returns {void}
   */
  private onOpen(dialog: cw.DialogInstance<any>) {
    console.assert(!!dialog, 'Argument "dialog" is missing');

    // Modal must be stored the dialog property to bind in Angular.
    this.dialog = dialog;

    // Loading DOM
    this.$scope.modalEnable = true;
    var promise = new Promise((resolve) => {
      this.$timeout(() => resolve(void 0), 0);
    });

    // After load
    promise.then(() => {
      (() => {
        // Remove a focus from the clicked button
        var el = document.createElement('input');
        document.body.appendChild(el);
        el.focus();
        document.body.removeChild(el);
      })();

      var el = document.getElementById('cw-modal-display');
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        dialog.close(event);
      });
      document.onkeydown = (event: KeyboardEvent) => {
        emitter.emit(dialog.dialogUuid + '.onKeyDown', event);
      };
      return dialog.template;

    }).then((template: string) => {
      var el = document.getElementById(ID_DRAWING_PART);
      el.innerHTML = template;
      el.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      this.$compile(el)(this.$element.scope());

    }).catch((err: string) => {
      throw Error(err);
    });
  }

  /**
   * @param {MouseEvent} event
   * @param {cw.DialogInstance<any>} dialog
   * @returns {void}
   */
  private onClose(event: MouseEvent, dialog: cw.DialogInstance<any>) {
    console.assert(!!dialog, 'Argument "dialog" is missing');

    // $timeout is required to apply changes of $scope.modalEnable
    this.$timeout(() => {
      document.getElementById(ID_DRAWING_PART).innerHTML = '';
      document.onkeydown = () => {}; // noop
      this.$scope.modalEnable = false;
      this.dialog = null;

      emitter.emit(dialog.dialogUuid + '.onClose', event);
    }, 0);
  }
}

var HTML = `
<div ng-if="modalEnable">
  <div id="cw-modal-backdrop" style="z-index: 1040; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 0.5; background: rgb(51, 51, 51);"></div>
  <div id="cw-modal-display" style="z-index: 1050; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 1;">
    <div id="${ID_DRAWING_PART}" class="modal-content" style="z-index: 1060; width: 600px; margin: 100px auto;"></div>
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

angular.module(MODULE_NAME, []);
angular.module(MODULE_NAME).directive(MODULE_NAME, ddo);