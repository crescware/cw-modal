/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="dialog.ts" />
'use strict';

import iDialog = require('./dialog');
import Dialog = iDialog.DialogInstance;

var angular: ng.IAngularStatic = this.angular || require('angular');

interface ModalElement {
  element: JQuery;
  id: string;
  zIndex: number;
}

export interface ModalProperty {
  dialog: Dialog;
}

class Modal {
  static moduleName = 'cwModal';
  dialog: Dialog;

  /**
   * @constructor
   * @ngInject
   */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $element: ng.IAugmentedJQuery,
    private $compile: ng.ICompileService
  ) {
    this.init();
  }

  /**
   * @returns {void}
   */
  private init() {
    this.$rootScope.$on('cwModal.Dialog#open',  this.onOpen.bind(this));
    this.$rootScope.$on('cwModal.Dialog#close', this.onClose.bind(this));
  }

  /**
   * @param {ng.IAngularEvent} _ non-use
   * @param {Dialog} dialog
   * @returns {void}
   */
  private onOpen(_: ng.IAngularEvent, dialog: Dialog) {
    this.dialog = dialog;
    this.$element.html('');

    var backdrop = this.createModalBackdrop();
    var display = this.createModalDisplay(backdrop.zIndex);
    var dialogRect = this.createDialogRect(display.zIndex);

    this.$element.append(backdrop.element).append(display.element);
    angular.element('#'+display.id)
      .append(dialogRect.element)
      .on('click', (event: JQueryEventObject) => {
        event.stopPropagation();
        dialog.close(event);
      });

    dialog.template.then((template: string) => {
      var templateEl = angular.element(template);
      angular.element('#'+dialogRect.id)
        .append(template)
        .on('click', (event: JQueryEventObject) => {
          event.stopPropagation();
        });
      this.$compile(this.$element.contents())(this.$element.scope());
    }).catch((err: string) => {
      throw Error(err);
    });
  }

  /**
   * @param {ng.IAngularEvent} _ non-use
   * @param {JQueryEventObject} jQueryEvent
   * @param {Dialog} dialog
   * @returns {void}
   */
  private onClose(_: ng.IAngularEvent, jQueryEvent: JQueryEventObject, dialog: Dialog) {
    this.$element.html('');
    this.dialog = null;
    this.$rootScope.$broadcast(dialog.dialogUuid + '.onClose', jQueryEvent);
  }

  /**
   * @returns {ModalElement}
   */
  private createModalBackdrop(): ModalElement {
    var element = angular.element('<div></div>');
    var id = 'cw-modal-backdrop';
    var zIndex = 1040;

    element.attr({id: id});
    element.css({
      'z-index': zIndex,
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '100%',
      background: '#333',
      opacity: 0.5
    });

    return {
      element: element,
      id: id,
      zIndex: zIndex
    };
  }

  /**
   * @param {number} backZIndex
   * @returns {ModalElement}
   */
  private createModalDisplay(backZIndex: number): ModalElement {
    var element = angular.element('<div></div>');
    var id = 'cw-modal-display';
    var zIndex = backZIndex + 10;

    element.attr({id: id});
    element.css({
      'z-index': zIndex,
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '100%',
      opacity: 1
    });

    return {
      element: element,
      id: id,
      zIndex: zIndex
    };
  }

  /**
   * @param {number} backZIndex
   * @returns {ModalElement}
   */
  private createDialogRect(backZIndex: number): ModalElement {
    var element = angular.element('<div></div>');
    var id = 'cw-modal-dialog-rect';
    var zIndex = backZIndex + 10;

    element.attr({
      id: id,
      'class': 'modal-content'
    });
    element.css({
      'z-index': zIndex,
      width: '900px',
      margin: '100px auto'
    });

    return {
      element: element,
      id: id,
      zIndex: zIndex
    };
  }
}

/**
 * @constructor
 */
function ModalDDO() {
  return {
    restrict: 'E',
    template: '',
    controller: Modal,
    controllerAs: 'Modal',
    scope: {}
  };
}

angular.module(Modal.moduleName, []);
angular.module(Modal.moduleName).directive(Modal.moduleName, ModalDDO);

this.Modal = Modal;