/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
'use strict';

var angular = this.angular || require('angular');

export module cwModal {
  var moduleName = 'cwModal';

  interface ModalElement {
    element: JQuery;
    id: string;
    zIndex: number;
  }

  export class Dialog {
    /**
     * @constructor
     */
    constructor(private template: string) {
      //
    }

    /**
     * @returns {void}
     */
    open() {
      var $rootScope: ng.IRootScopeService = angular.element('.ng-scope').eq(0).scope();
      $rootScope.$broadcast('cwModal.Dialog#open', this.template);
    }
  }

  class Modal {
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
      this.$rootScope.$on('cwModal.Dialog#open', this.onOpen.bind(this));
    }

    /**
     * @param {ng.IAngularEvent} _ non-use
     * @param {string} template
     * @returns {void}
     */
    private onOpen(_: ng.IAngularEvent, template: string) {
      this.$element.html('');

      var modalBackdrop = this.createModalBackdrop();
      var modalDisplay = this.createModalDisplay(modalBackdrop.zIndex);
      var dialogRect = this.createDialogRect(modalDisplay.zIndex);

      this.$element.append(modalBackdrop.element).append(modalDisplay.element);
      angular.element('#'+modalDisplay.id).append(dialogRect.element);
      angular.element('#'+dialogRect.id).append(template);

      this.$compile(this.$element.contents())(this.$element.scope());
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
      var id = 'cw-modal-front';
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
  export function ModalDDO() {
    return {
      restrict: 'E',
      template: '',
      controller: Modal,
      controllerAs: 'Modal'
    };
  }

  angular.module(moduleName, []);
  angular.module(moduleName).directive(moduleName, ModalDDO);
  angular.module(moduleName).factory('Dialog', () => Dialog);
}
